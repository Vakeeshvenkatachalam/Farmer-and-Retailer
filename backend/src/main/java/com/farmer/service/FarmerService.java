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

    @Autowired
    private FarmerRepository farmerRepository;

    // GET PROFILE
    public Farmer getFarmerById(Long id) {
        return farmerRepository.findById(id).orElse(null);
    }

    // UPDATE PROFILE
    public Farmer updateFarmer(Long id, Farmer farmer, MultipartFile file) throws Exception {
        Farmer existingFarmer = farmerRepository.findById(id).orElse(null);
        if (existingFarmer != null) {
            if (file != null && !file.getOriginalFilename().isEmpty()) {
                String fileName = file.getOriginalFilename();
                Path filePath = Paths.get("src/main/resources/static/images/", fileName);
                File destinationFile = new File(filePath.toUri());
                file.transferTo(destinationFile);
                existingFarmer.setProfileImage(fileName);
            }
            existingFarmer.setName(farmer.getName());
            existingFarmer.setEmail(farmer.getEmail());
            existingFarmer.setPhone(farmer.getPhone());
            return farmerRepository.save(existingFarmer);
        }
        return null;
    }

    // UPLOAD PROFILE IMAGE
    public String uploadProfileImage(Long id, MultipartFile file) throws Exception {
        Farmer existingFarmer = farmerRepository.findById(id).orElse(null);
        if (existingFarmer != null) {
            String fileName = file.getOriginalFilename();
            Path filePath = Paths.get("src/main/resources/static/images/", fileName);
            File destinationFile = new File(filePath.toUri());
            file.transferTo(destinationFile);
            existingFarmer.setProfileImage(fileName);
            farmerRepository.save(existingFarmer);
            return "Profile image uploaded successfully";
        }
        return "Farmer not found";
    }
}