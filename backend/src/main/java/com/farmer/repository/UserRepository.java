package com.farmer.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmer.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Login
    User findByEmailAndPassword(String email, String password);

    // Registration check
    User findByEmail(String email);

    // Admin approval list
    List<User> findByRoleAndApprovalStatus(String role, String approvalStatus);

}
