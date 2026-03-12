package com.farmer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.farmer.dto.AuthResponse;
import com.farmer.model.Farmer;
import com.farmer.model.Retailer;
import com.farmer.model.User;
import com.farmer.repository.FarmerRepository;
import com.farmer.repository.RetailerRepository;
import com.farmer.repository.UserRepository;
import com.farmer.util.JwtUtil;

@Service
public class AuthService {

    @Autowired private UserRepository userRepo;
    @Autowired private FarmerRepository farmerRepo;
    @Autowired private RetailerRepository retailerRepo;
    @Autowired private BCryptPasswordEncoder encoder;
    @Autowired private JwtUtil jwtUtil;

    public User register(User user) {
        if (userRepo.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("email exists");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new RuntimeException("password required");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        User saved = userRepo.save(user);

        String role = user.getRole() == null ? "" : user.getRole().toUpperCase();
        switch (role) {
            case "FARMER":
                Farmer f = new Farmer();
                f.setName(user.getName());
                f.setEmail(user.getEmail());
                f.setPhone(user.getPhone());
                farmerRepo.save(f);
                break;
            case "RETAILER":
                Retailer r = new Retailer();
                r.setName(user.getName());
                r.setEmail(user.getEmail());
                r.setPhone(user.getPhone());
                retailerRepo.save(r);
                break;
            default:
                break;
        }
        return saved;
    }

    public AuthResponse login(String email, String rawPassword) {
        User u = userRepo.findByEmail(email);
        if (u == null || !encoder.matches(rawPassword, u.getPassword())) {
            throw new RuntimeException("invalid credentials");
        }

        if ("FARMER".equals(u.getRole()) && !"APPROVED".equals(u.getApprovalStatus())) {
            throw new RuntimeException("Waiting for admin approval");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(u.getEmail(), u.getRole(), u.getId());

        return new AuthResponse(token, u.getRole(), u.getId(), u.getName(), u.getEmail());
    }
}