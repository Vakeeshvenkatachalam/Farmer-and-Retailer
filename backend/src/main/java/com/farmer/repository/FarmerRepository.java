package com.farmer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farmer.model.Farmer;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
}