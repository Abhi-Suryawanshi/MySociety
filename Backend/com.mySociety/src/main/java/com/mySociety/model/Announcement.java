package com.mySociety.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String content;
    @Column(name = "announcement_date")
    private LocalDate announcementDate;

    // Constructors
    public Announcement() {}

    public Announcement(String title, String content, LocalDate announcementDate) {
        this.title = title;
        this.content = content;
        this.announcementDate = announcementDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDate getAnnouncementDate() {
        return announcementDate;
    }

    public void setAnnouncementDate(LocalDate announcementDate) {
        this.announcementDate = announcementDate;
    }
}