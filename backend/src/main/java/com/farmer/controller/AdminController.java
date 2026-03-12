package com.farmer.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmer.model.User;
import com.farmer.repository.OrderRepository;
import com.farmer.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    // View Pending Farmers
    @GetMapping("/pending-farmers")
    public List<User> getPendingFarmers() {
        return userRepository.findByRoleAndApprovalStatus("FARMER", "PENDING");
    }

    // Approve Farmer
    @PutMapping("/approve/{id}")
    public String approveFarmer(@PathVariable Long id) {
        User farmer = userRepository.findById(id).orElse(null);
        if (farmer == null) return "Farmer not found";

        farmer.setApprovalStatus("APPROVED");
        userRepository.save(farmer);

        return "Farmer Approved";
    }

    // Reject Farmer
    @PutMapping("/reject/{id}")
    public String rejectFarmer(@PathVariable Long id) {
        User farmer = userRepository.findById(id).orElse(null);
        if (farmer == null) return "Farmer not found";

        farmer.setApprovalStatus("REJECTED");
        userRepository.save(farmer);

        return "Farmer Rejected";
    }

    // Admin Dashboard Stats
    @GetMapping("/stats")
    public Map<String, Object> getAdminStats() {

        Map<String, Object> stats = new HashMap<>();

        long totalFarmers = userRepository
                .findByRoleAndApprovalStatus("FARMER", "APPROVED").size()
                + userRepository
                .findByRoleAndApprovalStatus("FARMER", "PENDING").size();

        long pendingFarmers = userRepository
                .findByRoleAndApprovalStatus("FARMER", "PENDING").size();

        long approvedFarmers = userRepository
                .findByRoleAndApprovalStatus("FARMER", "APPROVED").size();

        long totalRetailers = userRepository
                .findByRoleAndApprovalStatus("RETAILER", "APPROVED").size();

        long totalOrders = orderRepository.count();

        stats.put("totalFarmers", totalFarmers);
        stats.put("pendingFarmers", pendingFarmers);
        stats.put("approvedFarmers", approvedFarmers);
        stats.put("totalRetailers", totalRetailers);
        stats.put("totalOrders", totalOrders);

        return stats;
    }
}