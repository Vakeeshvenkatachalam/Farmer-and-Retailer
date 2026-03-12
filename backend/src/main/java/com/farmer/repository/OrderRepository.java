package com.farmer.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.farmer.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByRetailerId(Long retailerId);

    // Get orders by farmer (through product)
    @Query("SELECT o FROM Order o WHERE o.productId IN (SELECT p.id FROM Product p WHERE p.farmerId = :farmerId)")
    List<Order> findByFarmerId(@Param("farmerId") Long farmerId);

    // Get orders by status
    List<Order> findByOrderStatus(String orderStatus);

    // Get orders by payment status
    List<Order> findByPaymentStatus(String paymentStatus);

    // Get orders by farmer and status
    @Query("SELECT o FROM Order o WHERE o.productId IN (SELECT p.id FROM Product p WHERE p.farmerId = :farmerId) AND o.orderStatus = :status")
    List<Order> findByFarmerIdAndStatus(@Param("farmerId") Long farmerId, @Param("status") String status);
}
