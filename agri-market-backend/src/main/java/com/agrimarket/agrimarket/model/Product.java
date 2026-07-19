package com.agrimarket.agrimarket.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    
    @Indexed
    private String vendorId;
    
    @Indexed
    private String categoryId;
    
    private String name;
    private String description;
    private String brand;
    private String unit;
    
    private Double price;
    private Double discountPercentage;
    
    private Integer stockQuantity;
    private String batchNumber;
    private LocalDate expiryDate;
    private String registrationNumber;
    
    private List<String> applicableCrops;
    private List<String> images;
    
    private String status;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
