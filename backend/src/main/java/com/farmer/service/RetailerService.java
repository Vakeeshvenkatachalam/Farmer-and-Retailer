package com.farmer.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.farmer.model.Retailer;
import com.farmer.repository.RetailerRepository;

@Service
public class RetailerService {

    @Autowired
    private RetailerRepository retailerRepository;

    private final String uploadDir = "uploads/";

    public Retailer getRetailerById(Long id) {
        return retailerRepository.findById(id).orElseThrow();
    }

    public Retailer updateRetailer(Long id, Retailer updatedRetailer, MultipartFile file) throws Exception {

        Retailer retailer = retailerRepository.findById(id).orElseThrow();

        retailer.setName(updatedRetailer.getName());
        retailer.setEmail(updatedRetailer.getEmail());
        retailer.setPhone(updatedRetailer.getPhone());
        // FIX: location was replaced by separate village/district/state fields
        retailer.setVillage(updatedRetailer.getVillage());
        retailer.setDistrict(updatedRetailer.getDistrict());
        retailer.setState(updatedRetailer.getState());

        if (file != null && !file.isEmpty()) {

            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdir();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.write(path, file.getBytes());

            retailer.setProfileImage("http://localhost:8080/uploads/" + fileName);
        }

        return retailerRepository.save(retailer);
    }
}