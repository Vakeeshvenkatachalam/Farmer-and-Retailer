package com.farmer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
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
}