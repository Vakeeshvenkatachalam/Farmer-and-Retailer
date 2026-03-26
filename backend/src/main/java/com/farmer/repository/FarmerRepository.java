package com.farmer.repository;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import com.farmer.model.Farmer;

public interface FarmerRepository extends CrudRepository<Farmer, Long> {

    List<Farmer> findByEmail(String email);

    Farmer findByPhone(String phone);

    @Query("SELECT f FROM Farmer f WHERE f.name LIKE %:searchTerm% OR f.email LIKE %:searchTerm% OR f.phone LIKE %:searchTerm%")
    List<Farmer> search(@Param("searchTerm") String searchTerm);

    @Query("SELECT f FROM Farmer f WHERE f.email = :email")
    Farmer findFarmerByEmail(@Param("email") String email);

    @Query("SELECT f FROM Farmer f WHERE f.phone = :phone")
    Farmer findFarmerByPhone(@Param("phone") String phone);
}