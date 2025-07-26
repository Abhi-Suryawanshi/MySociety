package com.mySociety.service;

import com.mySociety.model.Complaint;
import com.mySociety.model.Resident;
import com.mySociety.repository.ComplaintRepository;
import com.mySociety.repository.ResidentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ResidentRepository residentRepository;

    public ComplaintService(ComplaintRepository complaintRepository, ResidentRepository residentRepository) {
        this.complaintRepository = complaintRepository;
        this.residentRepository = residentRepository;
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Optional<Complaint> getComplaintById(Long id) {
        return complaintRepository.findById(id);
    }

    public Complaint submitComplaint(Long residentId, Complaint complaint) {
        Optional<Resident> residentOptional = residentRepository.findById(residentId);
        if (residentOptional.isPresent()) {
            complaint.setResident(residentOptional.get());
            complaint.setStatus("PENDING"); // Default status
            return complaintRepository.save(complaint);
        }
        throw new RuntimeException("Resident not found with ID: " + residentId);
    }

    public Optional<Complaint> updateComplaintStatus(Long id, String status) {
        return complaintRepository.findById(id)
                .map(complaint -> {
                    complaint.setStatus(status);
                    return complaintRepository.save(complaint);
                });
    }

    public List<Complaint> getComplaintsByResident(Long residentId) {
        return complaintRepository.findByResidentId(residentId);
    }
}