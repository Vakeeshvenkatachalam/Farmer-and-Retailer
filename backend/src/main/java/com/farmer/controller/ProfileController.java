package com.farmer.controller;

import com.farmer.model.Order;
import com.farmer.model.Product;
import com.farmer.model.User;
import com.farmer.repository.OrderRepository;
import com.farmer.repository.ProductRepository;
import com.farmer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/{userId}")
    public Map<String, Object> getProfile(@PathVariable Long userId) {

        User user = userRepository.findById(userId).orElse(null);

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("user", user);

        if ("FARMER".equals(user.getRole())) {
            List<Product> products = productRepository.findByFarmerId(userId);
            profileData.put("products", products);
            profileData.put("totalProducts", products.size());
        }

        if ("RETAILER".equals(user.getRole())) {
            List<Order> orders = orderRepository.findByRetailerId(userId);
            profileData.put("orders", orders);
            profileData.put("totalOrders", orders.size());
        }

        if ("ADMIN".equals(user.getRole())) {
            List<User> pending = userRepository
                    .findByRoleAndApprovalStatus("FARMER", "PENDING");
            profileData.put("pendingApprovals", pending.size());
        }

        return profileData;
    }
}
