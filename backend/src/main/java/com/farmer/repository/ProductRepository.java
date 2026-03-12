package com.farmer.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.farmer.model.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByFarmerId(Long farmerId);

    // Search by product name (case-insensitive)
    List<Product> findByProductNameContainingIgnoreCase(String productName);

    // Filter by category
    List<Product> findByCategory(String category);

    // Filter by price range
    @Query("SELECT p FROM Product p WHERE p.price >= :minPrice AND p.price <= :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

    // Search by category AND price range
    @Query("SELECT p FROM Product p WHERE p.category = :category AND p.price >= :minPrice AND p.price <= :maxPrice")
    List<Product> findByCategoryAndPriceRange(@Param("category") String category, @Param("minPrice") Double minPrice, @Param("maxPrice") Double maxPrice);

    // Search by name AND category
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%')) AND p.category = :category")
    List<Product> findByNameAndCategory(@Param("name") String name, @Param("category") String category);

    // Search by name AND farmer
    @Query("SELECT p FROM Product p WHERE LOWER(p.productName) LIKE LOWER(CONCAT('%', :name, '%')) AND p.farmerId = :farmerId")
    List<Product> findByNameAndFarmer(@Param("name") String name, @Param("farmerId") Long farmerId);
}
