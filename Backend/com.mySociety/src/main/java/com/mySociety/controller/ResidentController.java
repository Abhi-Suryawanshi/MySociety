package com.mySociety.controller;

import com.mySociety.model.Announcement;
import com.mySociety.model.Complaint;
import com.mySociety.model.Event;
import com.mySociety.model.Message;
import com.mySociety.model.Resident;
import com.mySociety.model.User;
import com.mySociety.service.AuthService;
import com.mySociety.service.AnnouncementService;
import com.mySociety.service.ComplaintService;
import com.mySociety.service.EventService;
import com.mySociety.service.MessageService;
import com.mySociety.service.ResidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/resident")
public class ResidentController {

    private final AuthService authService;
    private final ResidentService residentService;
    private final ComplaintService complaintService;
    private final AnnouncementService announcementService;
    private final EventService eventService;
    private final MessageService messageService;

    public ResidentController(AuthService authService, ResidentService residentService,
                              ComplaintService complaintService, AnnouncementService announcementService,
                              EventService eventService, MessageService messageService) {
        this.authService = authService;
        this.residentService = residentService;
        this.complaintService = complaintService;
        this.announcementService = announcementService;
        this.eventService = eventService;
        this.messageService = messageService;
    }

    // --- Helper for authorization ---
    private User authorizeResident(String token, Long residentId) {
        User user = authService.validateToken(token.substring(7));
        if (user == null || !user.getRole().equals("USER") || user.getResident() == null || !user.getResident().getId().equals(residentId)) {
            throw new SecurityException("Access Denied: Resident role required or unauthorized access.");
        }
        return user;
    }

    // --- Resident's own details ---
    @GetMapping("/{residentId}")
    public ResponseEntity<?> getResidentDetails(@RequestHeader("Authorization") String token,
                                                @PathVariable Long residentId) {
        try {
            authorizeResident(token, residentId);
            return residentService.getResidentById(residentId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Maintenance (can just mark as paid/unpaid in DB - simplified) ---
    @PutMapping("/{residentId}/maintenance/markPaid")
    public ResponseEntity<?> markMaintenancePaid(@RequestHeader("Authorization") String token,
                                                 @PathVariable Long residentId) {
        try {
            authorizeResident(token, residentId);
            // This is a placeholder. In a real app, you'd update a 'paid' status in the DB and re-fetch.
            return ResponseEntity.ok("Maintenance marked as paid (simulated).");
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }


    // --- Complaint Submission & Viewing ---
    @PostMapping("/{residentId}/complaints")
    public ResponseEntity<?> submitComplaint(@RequestHeader("Authorization") String token,
                                             @PathVariable Long residentId,
                                             @RequestBody Complaint complaint) {
        try {
            authorizeResident(token, residentId);
            Complaint createdComplaint = complaintService.submitComplaint(residentId, complaint);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdComplaint);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{residentId}/complaints")
    public ResponseEntity<?> getResidentComplaints(@RequestHeader("Authorization") String token,
                                                   @PathVariable Long residentId) {
        try {
            authorizeResident(token, residentId);
            return ResponseEntity.ok(complaintService.getComplaintsByResident(residentId));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Read Announcements ---
    @GetMapping("/announcements")
    public ResponseEntity<?> getAllAnnouncements(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.validateToken(token.substring(7));
            if (user == null || !user.getRole().equals("USER")) {
                throw new SecurityException("Access Denied: Resident role required.");
            }
            return ResponseEntity.ok(announcementService.getAllAnnouncements());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- See Upcoming Events ---
    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents(@RequestHeader("Authorization") String token) {
        try {
            User user = authService.validateToken(token.substring(7));
            if (user == null || !user.getRole().equals("USER")) {
                throw new SecurityException("Access Denied: Resident role required.");
            }
            return ResponseEntity.ok(eventService.getAllEvents());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Message Management (Resident replies to admin messages, views conversations) ---
    @PostMapping("/{residentId}/messages/reply")
    public ResponseEntity<?> replyToAdminMessage(@RequestHeader("Authorization") String token,
                                                 @PathVariable Long residentId,
                                                 @RequestBody Map<String, String> replyRequest) {
        try {
            User residentUser = authorizeResident(token, residentId);
            Long parentMessageId = Long.parseLong(replyRequest.get("parentMessageId"));
            String content = replyRequest.get("content");

            Message reply = messageService.replyToMessage(residentUser.getId(), parentMessageId, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(reply);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } 
    }

    @GetMapping("/{residentId}/messages/conversations")
    public ResponseEntity<?> getResidentConversations(@RequestHeader("Authorization") String token,
                                                      @PathVariable Long residentId) {
        try {
            User residentUser = authorizeResident(token, residentId);
            List<List<Message>> conversations = messageService.getConversationsForResident(residentId, residentUser.getId());
            return ResponseEntity.ok(conversations);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<?> markMessageAsRead(@RequestHeader("Authorization") String token,
                                               @PathVariable Long messageId) {
        try {
            User user = authService.validateToken(token.substring(7));
            if (user == null) {
                throw new SecurityException("Authentication required.");
            }
            // If user is resident, ensure they are marking their own message
            if (user.getRole().equals("USER") && user.getResident() != null) {
                Optional<Message> messageOptional = messageService.getMessageById(messageId);
                if (messageOptional.isPresent()) {
                    Message message = messageOptional.get();
                    if (message.getRecipientResident() == null || !message.getRecipientResident().getId().equals(user.getResident().getId())) {
                        throw new SecurityException("Unauthorized to mark this message as read.");
                    }
                } else {
                    return ResponseEntity.notFound().build();
                }
            }

            return messageService.markMessageAsRead(messageId, user.getId(), user.getRole())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}