package com.agrimarket.agrimarket.controller;

import com.agrimarket.agrimarket.model.Product;
import com.agrimarket.agrimarket.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping("/public/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/public/products/search")
    public ResponseEntity<List<Product>> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String brand) {
        return ResponseEntity.ok(productService.searchProducts(keyword, categoryId, minPrice, maxPrice, brand));
    }

    @GetMapping("/public/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/public/products/category/{categoryId}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    @PostMapping("/vendor/products")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.createProduct(product));
    }

    @PutMapping("/vendor/products/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/vendor/products/{id}")
    @PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vendor/products/my")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Product>> getMyProducts(@RequestParam String vendorId) {
        return ResponseEntity.ok(productService.getProductsByVendor(vendorId));
    }
}
