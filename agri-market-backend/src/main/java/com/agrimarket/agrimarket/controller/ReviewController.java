package com.agrimarket.agrimarket.controller;

import com.agrimarket.agrimarket.model.Review;
import com.agrimarket.agrimarket.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @PostMapping
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewService.addReview(review));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
