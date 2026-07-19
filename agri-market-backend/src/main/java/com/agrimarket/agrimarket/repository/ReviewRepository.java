package com.agrimarket.agrimarket.repository;

import com.agrimarket.agrimarket.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(String productId);
    List<Review> findByUserId(String userId);
    boolean existsByProductIdAndUserId(String productId, String userId);
}
