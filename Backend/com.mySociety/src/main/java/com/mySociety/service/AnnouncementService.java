package com.mySociety.service;

import com.mySociety.model.Announcement;
import com.mySociety.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository) {
        this.announcementRepository = announcementRepository;
    }

    public List<Announcement> getAllAnnouncements() {
        return announcementRepository.findAll();
    }

    public Optional<Announcement> getAnnouncementById(Long id) {
        return announcementRepository.findById(id);
    }

    public Announcement createAnnouncement(Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    public Optional<Announcement> updateAnnouncement(Long id, Announcement announcementDetails) {
        return announcementRepository.findById(id)
                .map(announcement -> {
                    announcement.setTitle(announcementDetails.getTitle());
                    announcement.setContent(announcementDetails.getContent());
                    announcement.setAnnouncementDate(announcementDetails.getAnnouncementDate());
                    return announcementRepository.save(announcement);
                });
    }

    public boolean deleteAnnouncement(Long id) {
        if (announcementRepository.existsById(id)) {
            announcementRepository.deleteById(id);
            return true;
        }
        return false;
    }
}