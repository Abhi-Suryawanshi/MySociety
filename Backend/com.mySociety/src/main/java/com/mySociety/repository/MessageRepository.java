package com.mySociety.repository;

import com.mySociety.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Find all initial messages sent by admin to a specific resident (parent_message_id is NULL)
    List<Message> findBySenderRoleAndRecipientResidentIdAndParentMessageIsNullOrderByCreatedAtDesc(String senderRole, Long recipientResidentId);

    // Find all replies for a given parent message, ordered chronologically
    List<Message> findByParentMessageIdOrderByCreatedAtAsc(Long parentMessageId);

    // Find messages where the resident is the sender or recipient, and it's an initial message (not a reply)
    // This helps in fetching the "threads" for a resident
    @Query("SELECT m FROM Message m WHERE " +
           "(m.senderUserId = :residentUserId AND m.senderRole = 'USER' AND m.parentMessage IS NULL) OR " + // Messages initiated by resident
           "(m.recipientResident.id = :residentId AND m.senderRole = 'ADMIN' AND m.parentMessage IS NULL) " + // Messages initiated by admin to resident
           "ORDER BY m.createdAt DESC")
    List<Message> findInitialMessagesForResident(@Param("residentId") Long residentId, @Param("residentUserId") Long residentUserId);

    // Find messages sent by a specific resident (for their own tracking)
    List<Message> findBySenderUserIdAndSenderRoleOrderByCreatedAtDesc(Long senderUserId, String senderRole);

    // Find messages sent to a specific resident (for their own tracking)
    List<Message> findByRecipientResidentIdOrderByCreatedAtDesc(Long recipientResidentId);
}