package com.mySociety.service;

import com.mySociety.model.Message;
import com.mySociety.model.Resident;
import com.mySociety.model.User;
import com.mySociety.repository.MessageRepository;
import com.mySociety.repository.ResidentRepository;
import com.mySociety.repository.UserRepository; // Inject UserRepository to get User details
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ResidentRepository residentRepository;
    private final UserRepository userRepository; // Inject UserRepository to get User details

    public MessageService(MessageRepository messageRepository, ResidentRepository residentRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.residentRepository = residentRepository;
        this.userRepository = userRepository;
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public Optional<Message> getMessageById(Long id) {
        return messageRepository.findById(id);
    }

    @Transactional
    public Message sendAdminMessageToResident(Long adminUserId, Long recipientResidentId, String subject, String content) {
        Optional<Resident> recipientResidentOptional = residentRepository.findById(recipientResidentId);
        if (recipientResidentOptional.isEmpty()) {
            throw new RuntimeException("Recipient resident not found with ID: " + recipientResidentId);
        }

        Message message = new Message();
        message.setSenderUserId(adminUserId);
        message.setSenderRole("ADMIN");
        message.setRecipientResident(recipientResidentOptional.get());
        message.setSubject(subject);
        message.setContent(content);
        message.setStatus("UNREAD"); // Initial messages from admin are unread by default

        return messageRepository.save(message);
    }

    @Transactional
    public Message replyToMessage(Long residentUserId, Long parentMessageId, String content) {
        Optional<Message> parentMessageOptional = messageRepository.findById(parentMessageId);
        if (parentMessageOptional.isEmpty()) {
            throw new RuntimeException("Parent message not found with ID: " + parentMessageId);
        }

        Message parentMessage = parentMessageOptional.get();
        Optional<User> residentUserOptional = userRepository.findById(residentUserId);
        if (residentUserOptional.isEmpty() || residentUserOptional.get().getResident() == null) {
            throw new RuntimeException("Resident user not found or not associated with a resident.");
        }

        // Ensure the resident replying is the one involved in the conversation
        // Either they are the original recipient, or the original sender.
        boolean isRecipient = parentMessage.getRecipientResident() != null && parentMessage.getRecipientResident().getId().equals(residentUserOptional.get().getResident().getId());
        boolean isSender = parentMessage.getSenderUserId().equals(residentUserId);

        if (!isRecipient && !isSender) {
            throw new RuntimeException("Unauthorized to reply to this message.");
        }

        Message reply = new Message();
        reply.setSenderUserId(residentUserId);
        reply.setSenderRole("USER");
        reply.setRecipientResident(parentMessage.getRecipientResident()); // Reply keeps the same recipient resident context
        reply.setParentMessage(parentMessage);
        reply.setSubject("RE: " + parentMessage.getSubject()); // Subject for replies
        reply.setContent(content);
        reply.setStatus("UNREAD"); // Reply is unread by admin

        // Mark parent message as read if the sender of the reply is the recipient of the parent message
        if (isRecipient && parentMessage.getStatus().equals("UNREAD")) {
            parentMessage.setStatus("READ");
            messageRepository.save(parentMessage);
        }

        return messageRepository.save(reply);
    }

    @Transactional
    public Optional<Message> markMessageAsRead(Long messageId, Long userId, String userRole) {
        return messageRepository.findById(messageId)
                .map(message -> {
                    boolean canMarkRead = false;
                    if (userRole.equals("ADMIN") && message.getSenderRole().equals("USER")) {
                        // Admin can mark messages sent by residents as read
                        canMarkRead = true;
                    } else if (userRole.equals("USER") && message.getRecipientResident() != null &&
                               message.getRecipientResident().getId().equals(userRepository.findById(userId).get().getResident().getId())) {
                        // Resident can mark messages sent to them by admin as read
                        canMarkRead = true;
                    }

                    if (canMarkRead && message.getStatus().equals("UNREAD")) {
                        message.setStatus("READ");
                        return messageRepository.save(message);
                    }
                    return message; // Return unchanged if not allowed or already read
                });
    }

    // New method to get all conversations for a specific resident
    // A conversation is an initial message from admin to resident, and all subsequent replies.
    // Or, an initial message from resident to admin (though this flow is being removed, keep for history)
    public List<List<Message>> getConversationsForResident(Long residentId, Long residentUserId) {
        List<Message> initialAdminMessages = messageRepository.findBySenderRoleAndRecipientResidentIdAndParentMessageIsNullOrderByCreatedAtDesc("ADMIN", residentId);
        List<List<Message>> conversations = new ArrayList<>();

        for (Message initialMessage : initialAdminMessages) {
            List<Message> thread = new ArrayList<>();
            thread.add(initialMessage);
            thread.addAll(messageRepository.findByParentMessageIdOrderByCreatedAtAsc(initialMessage.getId()));
            conversations.add(thread);
        }

        // Also include threads initiated by the resident, if any exist from previous versions
        // This query needs to get the initial message sent by the resident, then its replies
        List<Message> initialResidentMessages = messageRepository.findBySenderUserIdAndSenderRoleOrderByCreatedAtDesc(residentUserId, "USER")
                .stream()
                .filter(m -> m.getParentMessage() == null)
                .collect(Collectors.toList());

        for (Message initialMessage : initialResidentMessages) {
            List<Message> thread = new ArrayList<>();
            thread.add(initialMessage);
            thread.addAll(messageRepository.findByParentMessageIdOrderByCreatedAtAsc(initialMessage.getId()));
            conversations.add(thread);
        }

        // Sort conversations by the latest message in each thread
        conversations.sort((list1, list2) -> {
            Message lastMsg1 = list1.get(list1.size() - 1);
            Message lastMsg2 = list2.get(list2.size() - 1);
            return lastMsg2.getCreatedAt().compareTo(lastMsg1.getCreatedAt());
        });

        return conversations;
    }

    // Method to get a single message thread by its initial message ID
    public Optional<List<Message>> getMessageThread(Long initialMessageId) {
        Optional<Message> initialMessageOptional = messageRepository.findById(initialMessageId);
        if (initialMessageOptional.isEmpty() || initialMessageOptional.get().getParentMessage() != null) {
            return Optional.empty(); // Not an initial message or doesn't exist
        }
        Message initialMessage = initialMessageOptional.get();
        List<Message> thread = new ArrayList<>();
        thread.add(initialMessage);
        thread.addAll(messageRepository.findByParentMessageIdOrderByCreatedAtAsc(initialMessage.getId()));
        return Optional.of(thread);
    }
}