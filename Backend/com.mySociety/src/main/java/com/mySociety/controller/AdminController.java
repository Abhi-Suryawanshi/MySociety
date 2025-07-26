package com.mySociety.controller;

import com.mySociety.model.Announcement;
import com.mySociety.model.Complaint;
import com.mySociety.model.Event;
import com.mySociety.model.Message;
import com.mySociety.model.Resident;
import com.mySociety.model.User;
import com.mySociety.repository.ResidentRepository; // Added for flat number lookup
import com.mySociety.service.AuthService;
import com.mySociety.service.AnnouncementService;
import com.mySociety.service.ComplaintService;
import com.mySociety.service.EventService;
import com.mySociety.service.MessageService;
import com.mySociety.service.ResidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService authService;
    private final ResidentService residentService;
    private final ComplaintService complaintService;
    private final AnnouncementService announcementService;
    private final EventService eventService;
    private final MessageService messageService;
    private final ResidentRepository residentRepository; // Inject ResidentRepository

    public AdminController(AuthService authService, ResidentService residentService,
                           ComplaintService complaintService, AnnouncementService announcementService,
                           EventService eventService, MessageService messageService,
                           ResidentRepository residentRepository) {
        this.authService = authService;
        this.residentService = residentService;
        this.complaintService = complaintService;
        this.announcementService = announcementService;
        this.eventService = eventService;
        this.messageService = messageService;
        this.residentRepository = residentRepository;
    }

    // --- Helper for authorization ---
    private User authorizeAdmin(String token) {
        User user = authService.validateToken(token.substring(7));
        if (user == null || !user.getRole().equals("ADMIN")) {
            throw new SecurityException("Access Denied: Admin role required.");
        }
        return user;
    }

    // --- Resident Management ---
    @GetMapping("/residents")
    public ResponseEntity<?> getAllResidents(@RequestHeader("Authorization") String token) {
        try {
            authorizeAdmin(token);
            return ResponseEntity.ok(residentService.getAllResidents());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/residents")
    public ResponseEntity<?> createResident(@RequestHeader("Authorization") String token,
                                            @RequestBody Map<String, Object> residentRequest) {
        try {
            authorizeAdmin(token);
            Resident resident = new Resident();
            resident.setName((String) residentRequest.get("name"));
            resident.setEmail((String) residentRequest.get("email"));
            resident.setPhone((String) residentRequest.get("phone"));
            resident.setFlatNumber((String) residentRequest.get("flatNumber"));
            resident.setMaintenanceCharge(new java.math.BigDecimal(residentRequest.get("maintenanceCharge").toString()));

            String username = (String) residentRequest.get("username");
            String password = (String) residentRequest.get("password");

            Resident createdResident = residentService.createResident(resident, username, password);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdResident);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating resident: " + e.getMessage());
        }
    }

    @PutMapping("/residents/{id}")
    public ResponseEntity<?> updateResident(@RequestHeader("Authorization") String token,
                                            @PathVariable Long id, @RequestBody Resident residentDetails) {
        try {
            authorizeAdmin(token);
            return residentService.updateResident(id, residentDetails)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/residents/{id}")
    public ResponseEntity<?> deleteResident(@RequestHeader("Authorization") String token,
                                            @PathVariable Long id) {
        try {
            authorizeAdmin(token);
            if (residentService.deleteResident(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Complaint Management ---
    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(@RequestHeader("Authorization") String token) {
        try {
            authorizeAdmin(token);
            return ResponseEntity.ok(complaintService.getAllComplaints());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@RequestHeader("Authorization") String token,
                                                   @PathVariable Long id, @RequestBody Map<String, String> statusUpdate) {
        try {
            authorizeAdmin(token);
            String status = statusUpdate.get("status");
            return complaintService.updateComplaintStatus(id, status)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Announcement Management ---
    @GetMapping("/announcements")
    public ResponseEntity<?> getAllAnnouncements(@RequestHeader("Authorization") String token) {
        try {
            authorizeAdmin(token);
            return ResponseEntity.ok(announcementService.getAllAnnouncements());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/announcements")
    public ResponseEntity<?> createAnnouncement(@RequestHeader("Authorization") String token,
                                                @RequestBody Announcement announcement) {
        try {
            authorizeAdmin(token);
            announcement.setAnnouncementDate(LocalDate.now()); // Set current date
            return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.createAnnouncement(announcement));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/announcements/{id}")
    public ResponseEntity<?> updateAnnouncement(@RequestHeader("Authorization") String token,
                                                @PathVariable Long id, @RequestBody Announcement announcementDetails) {
        try {
            authorizeAdmin(token);
            return announcementService.updateAnnouncement(id, announcementDetails)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/announcements/{id}")
    public ResponseEntity<?> deleteAnnouncement(@RequestHeader("Authorization") String token,
                                                @PathVariable Long id) {
        try {
            authorizeAdmin(token);
            if (announcementService.deleteAnnouncement(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Event Management ---
    @GetMapping("/events")
    public ResponseEntity<?> getAllEvents(@RequestHeader("Authorization") String token) {
        try {
            authorizeAdmin(token);
            return ResponseEntity.ok(eventService.getAllEvents());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/events")
    public ResponseEntity<?> createEvent(@RequestHeader("Authorization") String token,
                                         @RequestBody Event event) {
        try {
            authorizeAdmin(token);
            return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(event));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<?> updateEvent(@RequestHeader("Authorization") String token,
                                         @PathVariable Long id, @RequestBody Event eventDetails) {
        try {
            authorizeAdmin(token);
            return eventService.updateEvent(id, eventDetails)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@RequestHeader("Authorization") String token,
                                         @PathVariable Long id) {
        try {
            authorizeAdmin(token);
            if (eventService.deleteEvent(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    // --- Message Management (Admin views all, sends to resident) ---
    @GetMapping("/messages")
    public ResponseEntity<?> getAllMessages(@RequestHeader("Authorization") String token) {
        try {
            authorizeAdmin(token);
            return ResponseEntity.ok(messageService.getAllMessages());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PutMapping("/messages/{id}/read")
    public ResponseEntity<?> markMessageAsRead(@RequestHeader("Authorization") String token,
                                               @PathVariable Long id) {
        try {
            User adminUser = authorizeAdmin(token);
            return messageService.markMessageAsRead(id, adminUser.getId(), adminUser.getRole())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    @PostMapping("/messages/send-to-resident")
    public ResponseEntity<?> sendAdminMessageToResident(@RequestHeader("Authorization") String token,
                                                        @RequestBody Map<String, String> messageRequest) {
        try {
            User adminUser = authorizeAdmin(token);
            String flatNumber = messageRequest.get("flatNumber");
            String subject = messageRequest.get("subject");
            String content = messageRequest.get("content");

            Optional<Resident> residentOptional = residentRepository.findByFlatNumber(flatNumber);
            if (residentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Resident with flat number " + flatNumber + " not found.");
            }
            Long recipientResidentId = residentOptional.get().getId();

            Message createdMessage = messageService.sendAdminMessageToResident(adminUser.getId(), recipientResidentId, subject, content);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdMessage);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}