package com.mySociety.repository;

import com.mySociety.model.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ResidentRepository extends JpaRepository<Resident, Long> {
    Optional<Resident> findByFlatNumber(String flatNumber);
}