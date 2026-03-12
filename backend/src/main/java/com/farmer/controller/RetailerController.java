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

import com.farmer.model.Retailer;
import com.farmer.service.RetailerService;

@RestController
@RequestMapping("/api/retailers")
@CrossOrigin(origins = "http://localhost:5173")
public class RetailerController {

    @Autowired
    private RetailerService retailerService;

    // GET PROFILE
    @GetMapping("/{id}")
    public ResponseEntity<Retailer> getRetailer(@PathVariable Long id) {
        return ResponseEntity.ok(retailerService.getRetailerById(id));
    }

    // UPDATE PROFILE
    @PutMapping("/update/{id}")
    public ResponseEntity<Retailer> updateRetailer(
            @PathVariable Long id,
            @ModelAttribute Retailer retailer,
            @RequestParam(value = "profileImage", required = false) MultipartFile file
    ) throws Exception {

        return ResponseEntity.ok(
                retailerService.updateRetailer(id, retailer, file)
        );
    }
}