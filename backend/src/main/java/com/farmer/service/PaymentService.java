package com.farmer.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.farmer.model.Order;
import com.farmer.model.Payment;
import com.farmer.repository.OrderRepository;
import com.farmer.repository.PaymentRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Value("${razorpay.key.id:YOUR_RAZORPAY_KEY_ID}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:YOUR_RAZORPAY_KEY_SECRET}")
    private String razorpayKeySecret;

    /**
     * Create Razorpay order for payment
     * Step 1: Create order and return Razorpay order details with order information
     */
    public Map<String, Object> createRazorpayOrder(Long orderId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        try {
            // Generate Razorpay order ID (in production, make API call to Razorpay)
            // For now, use a pseudo order ID format
            String razorpayOrderId = "order_" + System.currentTimeMillis();

            // Store payment record
            Payment payment = new Payment();
            payment.setOrderId(orderId);
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setAmount(order.getTotalPrice());
            payment.setCurrency("INR");
            payment.setStatus("PENDING");
            payment.setCreatedAt(LocalDateTime.now());
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            // Return order details with amount and keys needed for payment
            Map<String, Object> response = new HashMap<>();
            response.put("razorpayOrderId", razorpayOrderId);
            response.put("amount", (int) (order.getTotalPrice() * 100)); // Amount in paisa
            response.put("currency", "INR");
            response.put("keyId", razorpayKeyId);
            
            // Order details to display
            Map<String, Object> orderDetails = new HashMap<>();
            orderDetails.put("orderId", order.getId());
            orderDetails.put("totalPrice", order.getTotalPrice());
            orderDetails.put("quantity", order.getQuantity());
            orderDetails.put("productId", order.getProductId());
            orderDetails.put("retailerId", order.getRetailerId());
            response.put("orderDetails", orderDetails);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    /**
     * Verify Razorpay payment signature  
     * Step 2: Verify payment and mark order as paid
     */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, 
                                         String razorpaySignature) throws Exception {

        try {
            // In production, verify signature here using Razorpay SDK/API
            // For now, accept any verification (replace with actual verification)
            
            // Update payment status to SUCCESS
            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
            if (payment != null) {
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.setRazorpaySignature(razorpaySignature);
                payment.setStatus("SUCCESS");
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);

                // Update order status to PAID
                Order order = orderRepository.findById(payment.getOrderId())
                        .orElse(null);
                if (order != null) {
                    order.setPaymentStatus("PAID");
                    order.setOrderStatus("CONFIRMED");
                    orderRepository.save(order);
                }
                
                return true;
            }

            return false;

        } catch (Exception e) {
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        }
    }

    /**
     * Get payment details for order
     */
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    /**
     * Get payment details by Razorpay payment ID
     */
    public Payment getPaymentByRazorpayPaymentId(String razorpayPaymentId) {
        return paymentRepository.findByRazorpayPaymentId(razorpayPaymentId);
    }
}


