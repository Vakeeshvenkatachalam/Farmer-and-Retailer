package com.farmer.controller;

import com.farmer.model.Order;
import com.farmer.model.Product;
import com.farmer.repository.OrderRepository;
import com.farmer.repository.ProductRepository;
import com.farmer.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
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

    @Autowired
    private UserRepository userRepository;

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
            order.setOrderDate(new Date());
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
    public ResponseEntity<?> getRetailerOrders(@PathVariable Long retailerId) {
        List<Order> orders = orderRepository.findByRetailerId(retailerId);
        List<Map<String, Object>> responseList = new java.util.ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("quantity", order.getQuantity());
            map.put("totalPrice", order.getTotalPrice());
            map.put("orderStatus", order.getOrderStatus());
            map.put("paymentStatus", order.getPaymentStatus()); // Retailers need payment status
            
            Product product = productRepository.findById(order.getProductId()).orElse(null);
            map.put("productId", order.getProductId());
            map.put("productName", product != null ? product.getProductName() : "Unknown Product");
            
            com.farmer.model.User farmerUser = (product != null && product.getFarmerId() != null)
                    ? userRepository.findById(product.getFarmerId()).orElse(null) : null;
            map.put("farmerName", farmerUser != null ? farmerUser.getName() : "Unknown Farmer");
            
            responseList.add(map);
        }
        return ResponseEntity.ok(responseList);
    }

    // ===== ORDER STATUS WORKFLOW =====

    // Farmer: View all orders for their products
    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<?> getFarmerOrders(@PathVariable Long farmerId) {
        List<Order> orders = orderRepository.findByFarmerId(farmerId);
        List<Map<String, Object>> responseList = new java.util.ArrayList<>();
        
        for (Order order : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", order.getId());
            map.put("quantity", order.getQuantity());
            map.put("totalPrice", order.getTotalPrice());
            map.put("orderStatus", order.getOrderStatus());
            
            Product product = productRepository.findById(order.getProductId()).orElse(null);
            map.put("productName", product != null ? product.getProductName() : "Unknown Product");
            
            com.farmer.model.User retailerUser = userRepository.findById(order.getRetailerId()).orElse(null);
            map.put("retailerName", retailerUser != null ? retailerUser.getName() : "Unknown Retailer");
            
            responseList.add(map);
        }
        return ResponseEntity.ok(responseList);
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
