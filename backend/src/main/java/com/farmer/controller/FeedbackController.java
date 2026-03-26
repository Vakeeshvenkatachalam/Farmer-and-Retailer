package com.farmer.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.farmer.model.Feedback;
import com.farmer.model.Product;
import com.farmer.repository.ProductRepository;
import com.farmer.service.FeedbackService;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private ProductRepository productRepository;

    // POST /api/feedback/add
    @PostMapping("/add")
    public ResponseEntity<?> addFeedback(
            @RequestParam Long productId,
            @RequestParam String comment,
            @RequestParam int rating,
            @RequestParam(required = false) Long retailerId,
            @RequestParam(required = false) String reviewerName) {

        if (rating < 1 || rating > 5) {
            return ResponseEntity.badRequest().body("Rating must be between 1 and 5.");
        }

        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Feedback saved = feedbackService.createFeedback(productOpt.get(), comment, rating, retailerId, reviewerName);
        return ResponseEntity.ok(saved);
    }

    // GET /api/feedback/product/{productId}
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Feedback>> getFeedbackByProduct(@PathVariable Long productId) {
        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(feedbackService.getFeedbacksByProduct(productOpt.get()));
    }
}
