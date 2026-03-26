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

        System.out.println("User registered successfully in DB. Email: " + saved.getEmail() + " | Role: " + saved.getRole() + " | Status: " + saved.getApprovalStatus());

        String role = user.getRole() == null ? "" : user.getRole().toUpperCase();
        switch (role) {
            case "FARMER":
                Farmer f = new Farmer();
                f.setUser(saved); // Link @OneToOne relationship
                f.setName(user.getName());
                f.setEmail(user.getEmail());
                f.setPhone(user.getPhone());
                // FIX: map all fields that the form sends (previously dropped silently)
                f.setVillage(user.getVillage());
                f.setDistrict(user.getDistrict());
                f.setState(user.getState());
                f.setFarmType(user.getFarmType());
                f.setFarmerId(user.getFarmerId());
                farmerRepo.save(f);
                System.out.println("Farmer profile created and mapped for: " + saved.getEmail());
                break;
            case "RETAILER":
                Retailer r = new Retailer();
                r.setUser(saved); // Link @OneToOne relationship
                r.setName(user.getName());
                r.setEmail(user.getEmail());
                r.setPhone(user.getPhone());
                // FIX: map all fields that the form sends (previously dropped silently)
                r.setVillage(user.getVillage());
                r.setDistrict(user.getDistrict());
                r.setState(user.getState());
                retailerRepo.save(r);
                System.out.println("Retailer profile created and mapped for: " + saved.getEmail());
                break;
            default:
                break;
        }
        return saved;
    }


    // FIX: accept role from the login request so we can validate it
    public AuthResponse login(String email, String rawPassword, String role) {
        System.out.println("Attempting login for Email: " + email + " | Requested Role: " + role);
        User u = userRepo.findByEmail(email);

        // Bug fix #1: null check + password check
        if (u == null) {
            System.out.println("Login Failed: User not found in DB.");
            throw new RuntimeException("Invalid email or password.");
        }
        if (!encoder.matches(rawPassword, u.getPassword())) {
            System.out.println("Login Failed: Invalid DB password match (BCrypt failure).");
            throw new RuntimeException("Invalid email or password.");
        }

        // Bug fix #2: Role mismatch — reject if user selected wrong role
        if (role != null && !role.isEmpty() && !role.equalsIgnoreCase(u.getRole())) {
            System.out.println("Login Failed: Role mismatch. User is " + u.getRole() + " but selected " + role);
            throw new RuntimeException(
                "Role mismatch. This account is registered as " + u.getRole() + ", not " + role.toUpperCase() + "."
            );
        }

        // Bug fix #3: Approval gate applies to ALL roles
        if (!"APPROVED".equals(u.getApprovalStatus())) {
            System.out.println("Login Failed: Account is not APPROVED. Status is " + u.getApprovalStatus());
            String userRole = u.getRole() == null ? "User" : u.getRole();
            throw new RuntimeException(userRole + " account is awaiting admin approval or has been rejected.");
        }

        System.out.println("Login Success: Tokens generated for " + u.getEmail());
        String token = jwtUtil.generateToken(u.getEmail(), u.getRole(), u.getId());
        return new AuthResponse(token, u.getRole(), u.getId(), u.getName(), u.getEmail());
    }
}