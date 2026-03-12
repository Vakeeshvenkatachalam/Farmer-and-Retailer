package com.farmer.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.farmer.model.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderId(Long orderId);
    Payment findByRazorpayOrderId(String razorpayOrderId);
    Payment findByRazorpayPaymentId(String razorpayPaymentId);
}
