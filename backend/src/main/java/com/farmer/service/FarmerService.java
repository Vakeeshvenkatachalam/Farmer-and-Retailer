package com.farmer.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.farmer.model.Farmer;
import com.farmer.repository.FarmerRepository;

@Service
public class FarmerService {

    @Autowired private FarmerRepository repo;
    private final String uploadDir = "uploads/";

    public Farmer getFarmerById(Long id) {
        return repo.findById(id).orElseThrow();
    }

    public Farmer updateFarmer(Long id, Farmer f, MultipartFile file) throws Exception {
        Farmer existing = repo.findById(id).orElseThrow();
        
        existing.setName(f.getName());
        existing.setPhone(f.getPhone());
        existing.setLocation(f.getLocation());
        
        if (file != null && !file.isEmpty()) {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdir();
            }
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.write(path, file.getBytes());
            existing.setProfileImage("http://localhost:8080/uploads/" + fileName);
        }
        
        return repo.save(existing);
    }
}