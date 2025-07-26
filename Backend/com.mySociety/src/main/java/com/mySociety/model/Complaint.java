package com.mySociety.model;

import jakarta.persistence.*;

@Entity
@Table(name = "complaints")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String subject;
    private String description;
    private String status; // e.g., "PENDING", "RESOLVED"

    @ManyToOne
    @JoinColumn(name = "resident_id", nullable = false)
    private Resident resident;

    // Constructors
    public Complaint() {}

    public Complaint(String subject, String description, String status, Resident resident) {
        this.subject = subject;
        this.description = description;
        this.status = status;
        this.resident = resident;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Resident getResident() {
        return resident;
    }

    public void setResident(Resident resident) {
        this.resident = resident;
    }
}