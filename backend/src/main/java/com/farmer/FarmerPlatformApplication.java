package com.farmer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.boot.CommandLineRunner;
import com.farmer.model.User;
import com.farmer.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class FarmerPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmerPlatformApplication.class, args);
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("SET GLOBAL max_allowed_packet=104857600"); // 100MB
            System.out.println("✅ MySQL Limits Updated!");
        } catch (Exception e) {
            System.err.println("⚠️ Could not execute startup tasks: " + e.getMessage());
        }
    }

    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepository, BCryptPasswordEncoder encoder) {
        return args -> {
            String adminEmail = "admin@platform.com";
            User existingAdmin = userRepository.findByEmail(adminEmail);
            if (existingAdmin == null) {
                User admin = new User();
                admin.setName("Admin");
                admin.setEmail(adminEmail);
                admin.setPassword(encoder.encode("admin123"));
                admin.setRole("ADMIN");
                admin.setApprovalStatus("APPROVED");
                userRepository.save(admin);
                System.out.println("✅ DEFAULT ADMIN SEEDED: " + adminEmail);
            } else {
                // Ensure the password is correctly BCrypt encoded (in case user manually inserted plain-text)
                if (!existingAdmin.getPassword().startsWith("$2a$")) {
                    existingAdmin.setPassword(encoder.encode("admin123"));
                    userRepository.save(existingAdmin);
                    System.out.println("✅ ADMIN PASSWORD RE-HASHED FOR SECURITY: " + adminEmail);
                }
            }
        };
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}