package com.farmer.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.farmer.model.Feedback;
import com.farmer.model.Product;
import com.farmer.repository.FeedbackRepository;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    public Feedback createFeedback(Product product, String comment, int rating, Long retailerId, String reviewerName) {
        Feedback feedback = new Feedback();
        feedback.setProduct(product);
        feedback.setComment(comment);
        feedback.setRating(rating);
        feedback.setRetailerId(retailerId);
        feedback.setReviewerName(reviewerName != null ? reviewerName : "Anonymous");
        feedback.setCreatedAt(new Date());
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getFeedbacksByProduct(Product product) {
        return feedbackRepository.findAllByProduct(product);
    }
}