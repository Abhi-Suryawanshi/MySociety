package com.mySociety.service;

import com.mySociety.model.Resident;
import com.mySociety.model.User;
import com.mySociety.repository.ResidentRepository;
import com.mySociety.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ResidentService {

    private final ResidentRepository residentRepository;
    private final UserRepository userRepository;

    public ResidentService(ResidentRepository residentRepository, UserRepository userRepository) {
        this.residentRepository = residentRepository;
        this.userRepository = userRepository;
    }

    public List<Resident> getAllResidents() {
        return residentRepository.findAll();
    }

    public Optional<Resident> getResidentById(Long id) {
        return residentRepository.findById(id);
    }

    @Transactional
    public Resident createResident(Resident resident, String username, String password) {
        // Save resident first to get an ID
        Resident savedResident = residentRepository.save(resident);

        // Create a user for the resident
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password); // IMPORTANT: Hash this password in a real app!
        newUser.setRole("USER");
        newUser.setResident(savedResident);
        userRepository.save(newUser);

        return savedResident;
    }

    @Transactional
    public Optional<Resident> updateResident(Long id, Resident residentDetails) {
        return residentRepository.findById(id)
                .map(resident -> {
                    resident.setName(residentDetails.getName());
                    resident.setEmail(residentDetails.getEmail());
                    resident.setPhone(residentDetails.getPhone());
                    resident.setFlatNumber(residentDetails.getFlatNumber());
                    resident.setMaintenanceCharge(residentDetails.getMaintenanceCharge());
                    return residentRepository.save(resident);
                });
    }

    @Transactional
    public boolean deleteResident(Long id) {
        // First, delete associated user (if any)
        userRepository.findByResidentId(id).ifPresent(userRepository::delete);
        if (residentRepository.existsById(id)) {
            residentRepository.deleteById(id);
            return true;
        }
        return false;
    }
}