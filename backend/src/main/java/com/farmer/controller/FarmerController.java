package com.farmer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.farmer.model.Farmer;
import com.farmer.service.FarmerService;

@RestController
@RequestMapping("/api/farmers")
@CrossOrigin(origins = "http://localhost:5173")
public class FarmerController {

    @Autowired
    private FarmerService farmerService;

    // GET PROFILE
    @GetMapping("/{id}")
    public ResponseEntity<Farmer> getFarmer(@PathVariable Long id) {
        return ResponseEntity.ok(farmerService.getFarmerById(id));
    }

    // UPDATE PROFILE
    @PutMapping("/update/{id}")
    public ResponseEntity<Farmer> updateFarmer(
            @PathVariable Long id,
            @ModelAttribute Farmer farmer,
            @RequestParam(value = "profileImage", required = false) MultipartFile file
    ) throws Exception {

        return ResponseEntity.ok(
                farmerService.updateFarmer(id, farmer, file)
        );
    }

    // UPLOAD PROFILE IMAGE
    @PostMapping("/upload/{id}")
    public ResponseEntity<String> uploadProfileImage(
            @PathVariable Long id,
            @RequestParam("profileImage") MultipartFile file
    ) throws Exception {

        return ResponseEntity.ok(
                farmerService.uploadProfileImage(id, file)
        );
    }
}