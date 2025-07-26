package com.mySociety.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "residents")
public class Resident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String phone;
    @Column(name = "flat_number", unique = true)
    private String flatNumber;
    @Column(name = "maintenance_charge")
    private BigDecimal maintenanceCharge;

    // Constructors
    public Resident() {}

    public Resident(String name, String email, String phone, String flatNumber, BigDecimal maintenanceCharge) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.flatNumber = flatNumber;
        this.maintenanceCharge = maintenanceCharge;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getFlatNumber() {
        return flatNumber;
    }

    public void setFlatNumber(String flatNumber) {
        this.flatNumber = flatNumber;
    }

    public BigDecimal getMaintenanceCharge() {
        return maintenanceCharge;
    }

    public void setMaintenanceCharge(BigDecimal maintenanceCharge) {
        this.maintenanceCharge = maintenanceCharge;
    }
}