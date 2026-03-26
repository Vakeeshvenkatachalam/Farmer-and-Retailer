package com.farmer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmer.dto.AuthRequest;
import com.farmer.dto.AuthResponse;
import com.farmer.model.User;
import com.farmer.repository.UserRepository;
import com.farmer.service.AuthService;

// NOTE: CORS is handled globally in SecurityConfig — do NOT add @CrossOrigin here, it conflicts.
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    // REGISTER
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        try {
            System.out.println("[REGISTER] Incoming request: email=" + user.getEmail() + ", role=" + user.getRole());

            if (user.getEmail() == null || user.getEmail().isBlank()) {
                return ResponseEntity.badRequest().body("Email is required.");
            }
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                return ResponseEntity.badRequest().body("Password is required.");
            }
            if (user.getRole() == null || user.getRole().isBlank()) {
                return ResponseEntity.badRequest().body("Role is required.");
            }

            // Return 409 Conflict so the frontend can show a clear 'email exists' message
            if (userRepository.findByEmail(user.getEmail()) != null) {
                System.out.println("[REGISTER] Failed: Email already exists — " + user.getEmail());
                return ResponseEntity.status(HttpStatus.CONFLICT).body("This email is already registered. Please login instead.");
            }

            if ("FARMER".equalsIgnoreCase(user.getRole())) {
                user.setApprovalStatus("PENDING");
            } else {
                user.setApprovalStatus("APPROVED");
            }

            authService.register(user);
            System.out.println("[REGISTER] Success for: " + user.getEmail());
            return ResponseEntity.ok("Registration submitted successfully!");
        } catch (Exception e) {
            System.out.println("[REGISTER] Exception: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            // FIX: pass role so AuthService can validate role mismatch
            AuthResponse response = authService.login(
                authRequest.getEmail(),
                authRequest.getPassword(),
                authRequest.getRole()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}
