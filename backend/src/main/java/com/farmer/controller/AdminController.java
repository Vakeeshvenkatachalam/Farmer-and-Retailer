package com.farmer.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmer.model.Product;
import com.farmer.model.Order;
import com.farmer.model.User;
import com.farmer.repository.OrderRepository;
import com.farmer.repository.ProductRepository;
import com.farmer.repository.UserRepository;
import com.farmer.service.NotificationService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationService notificationService;

    // View Pending Farmers
    @GetMapping("/pending-farmers")
    public List<User> getPendingFarmers() {
        return userRepository.findByRoleAndApprovalStatus("FARMER", "PENDING");
    }

    // Approve Farmer
    @PutMapping("/approve/{id}")
    public String approveFarmer(@PathVariable Long id) {
        User farmer = userRepository.findById(id).orElse(null);
        if (farmer == null) return "Farmer not found";

        farmer.setApprovalStatus("APPROVED");
        userRepository.save(farmer);

        notificationService.createNotification(farmer.getId(), "FARMER", "Account Approved!", "Your account has been approved by the Administrator. You can now start listing products.", "APPROVAL");

        return "Farmer Approved";
    }

    // Reject Farmer
    @PutMapping("/reject/{id}")
    public String rejectFarmer(@PathVariable Long id) {
        User farmer = userRepository.findById(id).orElse(null);
        if (farmer == null) return "Farmer not found";

        farmer.setApprovalStatus("REJECTED");
        userRepository.save(farmer);

        notificationService.createNotification(farmer.getId(), "FARMER", "Registration Rejected", "Your registration has been rejected by the Administrator. Please contact support for more details.", "APPROVAL");

        return "Farmer Rejected";
    }

    // View All Farmers
    @GetMapping("/farmers")
    public List<User> getAllFarmers() {
        return userRepository.findByRoleAndApprovalStatus("FARMER", "APPROVED"); 
        // Note: For admin view, we might want ALL farmers, but let's just return all farmers
    }

    // View All Farmers (Unfiltered for table)
    @GetMapping("/all-farmers")
    public List<User> getAllFarmersUnfiltered() {
        return userRepository.findAll().stream().filter(u -> "FARMER".equals(u.getRole())).toList();
    }

    // View All Retailers
    @GetMapping("/retailers")
    public List<User> getRetailers() {
        return userRepository.findAll().stream().filter(u -> "RETAILER".equals(u.getRole())).toList();
    }

    // View All Products
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // View All Orders
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Admin Dashboard Stats
    @GetMapping("/stats")
    public Map<String, Object> getAdminStats() {

        Map<String, Object> stats = new HashMap<>();

        // FIX: was making 5 separate DB calls. Now caches results in local lists.
        List<User> approvedFarmersList = userRepository.findByRoleAndApprovalStatus("FARMER", "APPROVED");
        List<User> pendingFarmersList  = userRepository.findByRoleAndApprovalStatus("FARMER", "PENDING");
        List<User> approvedRetailersList = userRepository.findByRoleAndApprovalStatus("RETAILER", "APPROVED");

        long approvedFarmers = approvedFarmersList.size();
        long pendingFarmers  = pendingFarmersList.size();
        long totalFarmers    = approvedFarmers + pendingFarmers;
        long totalRetailers  = approvedRetailersList.size();
        long totalOrders     = orderRepository.count();

        stats.put("totalFarmers", totalFarmers);
        stats.put("pendingFarmers", pendingFarmers);
        stats.put("approvedFarmers", approvedFarmers);
        stats.put("totalRetailers", totalRetailers);
        stats.put("totalOrders", totalOrders);

        return stats;
    }

    // Comprehensive Admin Analytics
    @GetMapping("/analytics")
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<User> allUsers = userRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();
        List<Product> allProducts = productRepository.findAll();

        long approvedFarmers = allUsers.stream().filter(u -> "FARMER".equals(u.getRole()) && "APPROVED".equals(u.getApprovalStatus())).count();
        long pendingFarmers = allUsers.stream().filter(u -> "FARMER".equals(u.getRole()) && "PENDING".equals(u.getApprovalStatus())).count();
        long rejectedFarmers = allUsers.stream().filter(u -> "FARMER".equals(u.getRole()) && "REJECTED".equals(u.getApprovalStatus())).count();
        long totalFarmers = approvedFarmers + pendingFarmers + rejectedFarmers;
        
        long totalRetailers = allUsers.stream().filter(u -> "RETAILER".equals(u.getRole())).count();
        long totalProducts = allProducts.size();
        long totalOrders = allOrders.size();
        
        // Calculate Revenue (Total from Delivered or Confirmed orders, assuming all for now for demo)
        double totalRevenue = allOrders.stream().mapToDouble(Order::getTotalPrice).sum();

        // Calculate Real Monthly Data
        Map<String, Double> revenueByMonth = new HashMap<>();
        Map<String, Integer> ordersByMonth = new HashMap<>();
        
        java.text.SimpleDateFormat monthFormat = new java.text.SimpleDateFormat("MMM yyyy");
        
        for (Order o : allOrders) {
            if (o.getOrderDate() != null) {
                String month = monthFormat.format(o.getOrderDate());
                revenueByMonth.put(month, revenueByMonth.getOrDefault(month, 0.0) + o.getTotalPrice());
                ordersByMonth.put(month, ordersByMonth.getOrDefault(month, 0) + 1);
            }
        }

        List<Map<String, Object>> monthlyData = new java.util.ArrayList<>();
        // To keep it simple, just add the months that have data
        for (String month : revenueByMonth.keySet()) {
            Map<String, Object> data = new HashMap<>();
            data.put("month", month);
            data.put("revenue", revenueByMonth.get(month));
            data.put("orders", ordersByMonth.getOrDefault(month, 0));
            monthlyData.add(data);
        }
        
        // Sort monthly data (optional, simplified here)
        monthlyData.sort((a, b) -> ((String)a.get("month")).compareTo((String)b.get("month")));

        // 1. STATS
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFarmers", totalFarmers);
        stats.put("approvedFarmers", approvedFarmers);
        stats.put("pendingApprovals", pendingFarmers);
        stats.put("totalRetailers", totalRetailers);
        stats.put("totalProducts", totalProducts);
        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        
        // Removed mock growth
        stats.put("monthlyGrowth", monthlyData.size() > 1 ? "Active" : "New"); 
        analytics.put("stats", stats);

        // 2. CATEGORY DISTRIBUTION
        Map<String, Long> categoryCount = new HashMap<>();
        for (Product p : allProducts) {
            String cat = p.getCategory() != null ? p.getCategory() : "Other";
            categoryCount.put(cat, categoryCount.getOrDefault(cat, 0L) + 1);
        }
        List<Map<String, Object>> categoryDistribution = new java.util.ArrayList<>();
        categoryCount.forEach((k, v) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", k);
            map.put("value", v);
            categoryDistribution.add(map);
        });
        analytics.put("categoryDistribution", categoryDistribution);

        // 3. FARMER APPROVAL STATUS
        List<Map<String, Object>> farmerStatus = new java.util.ArrayList<>();
        farmerStatus.add(Map.of("name", "Approved", "value", approvedFarmers));
        farmerStatus.add(Map.of("name", "Pending", "value", pendingFarmers));
        farmerStatus.add(Map.of("name", "Rejected", "value", rejectedFarmers));
        analytics.put("farmerApprovalStatus", farmerStatus);

        // 4. MONTHLY ORDERS & REVENUE
        analytics.put("monthlyOrdersGrowth", monthlyData);
        analytics.put("revenueAnalytics", monthlyData);

        // 5. INVENTORY INSIGHTS
        long lowStockCount = allProducts.stream().filter(p -> p.getQuantity() > 0 && p.getQuantity() <= 10).count();
        long outOfStockCount = allProducts.stream().filter(p -> p.getQuantity() == 0).count();
        Map<String, Object> inventory = new HashMap<>();
        inventory.put("lowStock", lowStockCount);
        inventory.put("outOfStock", outOfStockCount);
        inventory.put("mostAddedCategory", categoryCount.isEmpty() ? "N/A" : categoryCount.entrySet().stream().max(Map.Entry.comparingByValue()).get().getKey());
        analytics.put("inventoryInsights", inventory);

        // 6. TOP FARMERS (Real data based on product count as fallback)
        List<Map<String, Object>> topFarmersList = new java.util.ArrayList<>();
        List<User> approvedFarmersList = allUsers.stream().filter(u -> "FARMER".equals(u.getRole()) && "APPROVED".equals(u.getApprovalStatus())).toList();
        for (User f : approvedFarmersList) {
            long pCount = allProducts.stream().filter(p -> p.getFarmerId() != null && p.getFarmerId().equals(f.getId())).count();
            if (pCount > 0) {
                Map<String, Object> tf = new HashMap<>();
                tf.put("id", f.getId());
                tf.put("name", f.getName());
                tf.put("email", f.getEmail());
                tf.put("productCount", pCount);
                topFarmersList.add(tf);
            }
        }
        // sort by product count descending
        topFarmersList.sort((a, b) -> Long.compare((Long)b.get("productCount"), (Long)a.get("productCount")));
        analytics.put("topFarmers", topFarmersList.subList(0, Math.min(3, topFarmersList.size())));

        return analytics;
    }
}