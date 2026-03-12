package com.farmer.controller;

import com.farmer.model.Product;
import com.farmer.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // ✅ Farmer Add Product
    @PostMapping("/add")
    public Product addProduct(@RequestBody Product product) {
        return productRepository.save(product);
    }

    // ✅ Farmer View Own Products
    @GetMapping("/farmer/{farmerId}")
    public List<Product> getFarmerProducts(@PathVariable Long farmerId) {
        return productRepository.findByFarmerId(farmerId);
    }

    // ✅ Retailer Browse All Products
    @GetMapping("/all")
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ===== SEARCH & FILTERING ENDPOINTS =====

    // Search by product name
    @GetMapping("/search")
    public List<Product> searchByName(@RequestParam String name) {
        return productRepository.findByProductNameContainingIgnoreCase(name);
    }

    // Filter by category
    @GetMapping("/category/{category}")
    public List<Product> getByCategory(@PathVariable String category) {
        return productRepository.findByCategory(category);
    }

    // Filter by price range
    @GetMapping("/price-range")
    public List<Product> getByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        return productRepository.findByPriceRange(minPrice, maxPrice);
    }

    // Advanced filter: Category + Price Range
    @GetMapping("/filter")
    public List<Product> filterProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {

        // If only name is provided
        if (name != null && category == null && minPrice == null) {
            return productRepository.findByProductNameContainingIgnoreCase(name);
        }

        // If only category is provided
        if (category != null && name == null && minPrice == null) {
            return productRepository.findByCategory(category);
        }

        // If category and name provided
        if (category != null && name != null && minPrice == null) {
            return productRepository.findByNameAndCategory(name, category);
        }

        // If price range provided
        if (minPrice != null && maxPrice != null && category == null && name == null) {
            return productRepository.findByPriceRange(minPrice, maxPrice);
        }

        // If category and price range provided
        if (category != null && minPrice != null && maxPrice != null) {
            return productRepository.findByCategoryAndPriceRange(category, minPrice, maxPrice);
        }

        // Default: return all
        return productRepository.findAll();
    }

    // Get product by ID
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
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
