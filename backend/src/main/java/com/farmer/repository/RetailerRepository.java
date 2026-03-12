package com.farmer.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.farmer.model.Retailer;

public interface RetailerRepository extends JpaRepository<Retailer, Long> {
}