package com.farmer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.farmer.model.Admin;

public interface AdminRepository extends JpaRepository<Admin, Long> {
}