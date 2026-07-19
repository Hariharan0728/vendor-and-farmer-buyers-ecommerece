package com.agrimarket.agrimarket.service;

import com.agrimarket.agrimarket.exception.BadRequestException;
import com.agrimarket.agrimarket.model.Review;
import com.agrimarket.agrimarket.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    public List<Review> getReviewsByProduct(String productId) {
        return reviewRepository.findByProductId(productId);
    }

    public Review addReview(Review review) {
        if (reviewRepository.existsByProductIdAndUserId(review.getProductId(), review.getUserId())) {
            throw new BadRequestException("You have already reviewed this product.");
        }
        return reviewRepository.save(review);
    }

    public void deleteReview(String id) {
        reviewRepository.deleteById(id);
    }
}
