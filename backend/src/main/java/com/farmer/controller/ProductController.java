package com.farmer.controller;

import com.farmer.model.Product;
import com.farmer.model.User;
import com.farmer.repository.ProductRepository;
import com.farmer.repository.UserRepository;
import com.farmer.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    // ✅ Farmer Add Product
    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        notificationService.createNotification(
            null,
            "RETAILER",
            "New Product Available",
            "A new crop \"" + saved.getProductName() + "\" has been listed under \"" + saved.getCategory() + "\" at ₹" + saved.getPrice() + "/kg.",
            "NEW_PRODUCT"
        );
        return saved;
    }

    // ✅ Farmer View Own Products
    @GetMapping("/farmer/{farmerId}")
    public List<Product> getFarmerProducts(@PathVariable Long farmerId) {
        return productRepository.findByFarmerId(farmerId);
    }

    // Helper to enrich product with farmer info
    private List<Map<String, Object>> enrichProducts(List<Product> products) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Product p : products) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("productName", p.getProductName());
            map.put("category", p.getCategory());
            map.put("price", p.getPrice());
            map.put("quantity", p.getQuantity());
            map.put("unit", p.getUnit());
            map.put("farmerId", p.getFarmerId());
            map.put("imageUrl", p.getImageUrl());
            
            if (p.getFarmerId() != null) {
                User farmer = userRepository.findById(p.getFarmerId()).orElse(null);
                if (farmer != null) {
                    map.put("farmerName", farmer.getName());
                    map.put("farmerVerified", "APPROVED".equalsIgnoreCase(farmer.getApprovalStatus()));
                    map.put("farmerDistrict", farmer.getDistrict());
                    map.put("farmerState", farmer.getState());
                } else {
                    map.put("farmerName", "Unknown Farmer");
                    map.put("farmerVerified", false);
                }
            } else {
                map.put("farmerName", "Unknown Farmer");
                map.put("farmerVerified", false);
            }
            list.add(map);
        }
        return list;
    }

    // ✅ Retailer Browse All Products
    @GetMapping("/all")
    public List<Map<String, Object>> getAllProducts() {
        return enrichProducts(productRepository.findAll());
    }

    // ===== SEARCH & FILTERING ENDPOINTS =====

    // Search by product name
    @GetMapping("/search")
    public List<Map<String, Object>> searchByName(@RequestParam String name) {
        return enrichProducts(productRepository.findByProductNameContainingIgnoreCase(name));
    }

    // Filter by category
    @GetMapping("/category/{category}")
    public List<Map<String, Object>> getByCategory(@PathVariable String category) {
        return enrichProducts(productRepository.findByCategory(category));
    }

    // Filter by price range
    @GetMapping("/price-range")
    public List<Map<String, Object>> getByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        return enrichProducts(productRepository.findByPriceRange(minPrice, maxPrice));
    }

    // Advanced filter: Category + Price Range
    @GetMapping("/filter")
    public List<Map<String, Object>> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        List<Product> list;
        if (name != null && category == null && minPrice == null) {
            list = productRepository.findByProductNameContainingIgnoreCase(name);
        } else if (category != null && name == null && minPrice == null) {
            list = productRepository.findByCategory(category);
        } else if (category != null && name != null && minPrice == null) {
            list = productRepository.findByNameAndCategory(name, category);
        } else if (minPrice != null && maxPrice != null && category == null && name == null) {
            list = productRepository.findByPriceRange(minPrice, maxPrice);
        } else if (category != null && minPrice != null && maxPrice != null) {
            list = productRepository.findByCategoryAndPriceRange(category, minPrice, maxPrice);
        } else {
            list = productRepository.findAll();
        }
        return enrichProducts(list);
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product p = productRepository.findById(id).orElse(null);
        if (p == null) {
            return ResponseEntity.notFound().build();
        }
        List<Product> temp = new ArrayList<>();
        temp.add(p);
        return ResponseEntity.ok(enrichProducts(temp).get(0));
    }

    // Update product
    @PutMapping("/update/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            if (productDetails.getProductName() != null) product.setProductName(productDetails.getProductName());
            if (productDetails.getCategory() != null) product.setCategory(productDetails.getCategory());
            if (productDetails.getPrice() > 0) product.setPrice(productDetails.getPrice());
            if (productDetails.getQuantity() > 0) product.setQuantity(productDetails.getQuantity());
            if (productDetails.getUnit() != null) product.setUnit(productDetails.getUnit());
            return productRepository.save(product);
        }
        return null;
    }

    // Delete product
    @DeleteMapping("/delete/{id}")
    public String deleteProduct(@PathVariable Long id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return "Product deleted successfully";
        }
        return "Product not found";
    }
}
