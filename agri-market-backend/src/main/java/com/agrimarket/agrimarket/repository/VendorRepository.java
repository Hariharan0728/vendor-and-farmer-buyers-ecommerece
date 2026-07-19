package com.agrimarket.agrimarket.repository;

import com.agrimarket.agrimarket.model.Vendor;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends MongoRepository<Vendor, String> {
    Optional<Vendor> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
