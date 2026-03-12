package com.farmer.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.farmer.model.Admin;
import com.farmer.repository.AdminRepository;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    private final String uploadDir = "uploads/";

    public Admin getAdminById(Long id) {
        return adminRepository.findById(id).orElseThrow();
    }

    public Admin updateAdmin(Long id, Admin updatedAdmin, MultipartFile file) throws Exception {

        Admin admin = adminRepository.findById(id).orElseThrow();

        admin.setName(updatedAdmin.getName());
        admin.setEmail(updatedAdmin.getEmail());
        admin.setPhone(updatedAdmin.getPhone());

        if (file != null && !file.isEmpty()) {

            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdir();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.write(path, file.getBytes());

            admin.setProfileImage("http://localhost:8080/uploads/" + fileName);
        }

        return adminRepository.save(admin);
    }
}