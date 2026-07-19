package com.agrimarket.agrimarket.service;

import com.agrimarket.agrimarket.exception.ResourceNotFoundException;
import com.agrimarket.agrimarket.model.Product;
import com.agrimarket.agrimarket.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    public List<Product> getProductsByVendor(String vendorId) {
        return productRepository.findByVendorId(vendorId);
    }

    public List<Product> getProductsByCategory(String categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> searchProducts(String keyword, String categoryId, Double minPrice, Double maxPrice, String brand) {
        Query query = new Query();
        if (keyword != null && !keyword.isBlank()) {
            query.addCriteria(Criteria.where("name").regex(keyword, "i"));
        }
        if (categoryId != null && !categoryId.isBlank()) {
            query.addCriteria(Criteria.where("categoryId").is(categoryId));
        }
        if (minPrice != null && maxPrice != null) {
            query.addCriteria(Criteria.where("price").gte(minPrice).lte(maxPrice));
        }
        if (brand != null && !brand.isBlank()) {
            query.addCriteria(Criteria.where("brand").regex(brand, "i"));
        }
        return mongoTemplate.find(query, Product.class);
    }

    public Product createProduct(Product product) {
        product.setStatus("ACTIVE");
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updated) {
        Product existing = getProductById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setBrand(updated.getBrand());
        existing.setUnit(updated.getUnit());
        existing.setPrice(updated.getPrice());
        existing.setDiscountPercentage(updated.getDiscountPercentage());
        existing.setStockQuantity(updated.getStockQuantity());
        existing.setBatchNumber(updated.getBatchNumber());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setRegistrationNumber(updated.getRegistrationNumber());
        existing.setApplicableCrops(updated.getApplicableCrops());
        existing.setImages(updated.getImages());
        existing.setStatus(updated.getStatus());
        return productRepository.save(existing);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }
}
