package com.farmer.controller;

import com.farmer.model.Order;
import com.farmer.model.Product;
import com.farmer.repository.OrderRepository;
import com.farmer.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    // ✅ Retailer Place Order
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder(@RequestBody Order order) {
        try {
            Product product = productRepository.findById(order.getProductId()).orElse(null);

            if (product == null) {
                return ResponseEntity.badRequest().body("Product not found");
            }

            if (product.getQuantity() < order.getQuantity()) {
                return ResponseEntity.badRequest().body("Insufficient stock");
            }

            product.setQuantity(product.getQuantity() - order.getQuantity());
            productRepository.save(product);

            order.setTotalPrice(product.getPrice() * order.getQuantity());
            order.setOrderDate(LocalDateTime.now());
            order.setOrderStatus("PENDING");
            order.setPaymentStatus("PENDING");

            Order savedOrder = orderRepository.save(order);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Order placed successfully");
            response.put("order", savedOrder);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error placing order: " + e.getMessage());
        }
    }

    // ✅ Retailer View Own Orders
    @GetMapping("/retailer/{retailerId}")
    public List<Order> getRetailerOrders(@PathVariable Long retailerId) {
        return orderRepository.findByRetailerId(retailerId);
    }

    // ===== ORDER STATUS WORKFLOW =====

    // Farmer: View all orders for their products
    @GetMapping("/farmer/{farmerId}")
    public List<Order> getFarmerOrders(@PathVariable Long farmerId) {
        return orderRepository.findByFarmerId(farmerId);
    }

    // Farmer: Get pending orders (awaiting confirmation)
    @GetMapping("/farmer/{farmerId}/pending")
    public List<Order> getPendingOrders(@PathVariable Long farmerId) {
        return orderRepository.findByFarmerIdAndStatus(farmerId, "PENDING");
    }

    // Farmer: Confirm order (mark as CONFIRMED)
    @PutMapping("/confirm/{orderId}")
    public ResponseEntity<?> confirmOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus("CONFIRMED");
        Order updated = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order confirmed successfully");
        response.put("order", updated);
        return ResponseEntity.ok(response);
    }

    // Farmer: Mark order as shipped
    @PutMapping("/ship/{orderId}")
    public ResponseEntity<?> shipOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"CONFIRMED".equals(order.getOrderStatus())) {
            return ResponseEntity.badRequest().body("Order must be confirmed before shipping");
        }

        order.setOrderStatus("SHIPPED");
        Order updated = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order shipped successfully");
        response.put("order", updated);
        return ResponseEntity.ok(response);
    }

    // Farmer: Mark order as delivered
    @PutMapping("/deliver/{orderId}")
    public ResponseEntity<?> deliverOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"SHIPPED".equals(order.getOrderStatus())) {
            return ResponseEntity.badRequest().body("Order must be shipped before delivery");
        }

        order.setOrderStatus("DELIVERED");
        Order updated = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order delivered successfully");
        response.put("order", updated);
        return ResponseEntity.ok(response);
    }

    // Retailer/Farmer: Cancel order
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("DELIVERED".equals(order.getOrderStatus()) || "COMPLETED".equals(order.getOrderStatus())) {
            return ResponseEntity.badRequest().body("Cannot cancel delivered or completed orders");
        }

        // Restore product stock
        Product product = productRepository.findById(order.getProductId()).orElse(null);
        if (product != null) {
            product.setQuantity(product.getQuantity() + order.getQuantity());
            productRepository.save(product);
        }

        order.setOrderStatus("CANCELLED");
        Order updated = orderRepository.save(order);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order cancelled successfully");
        response.put("order", updated);
        return ResponseEntity.ok(response);
    }

    // Get order details by ID
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElse(null);

        if (order == null) {
            return ResponseEntity.notFound().build();
        }

        // Get product details
        Product product = productRepository.findById(order.getProductId()).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("order", order);
        response.put("product", product);
        return ResponseEntity.ok(response);
    }

    // Get orders by status
    @GetMapping("/status/{status}")
    public List<Order> getOrdersByStatus(@PathVariable String status) {
        return orderRepository.findByOrderStatus(status);
    }
}
