package com.agrimarket.agrimarket.controller;

import com.agrimarket.agrimarket.model.Cart;
import com.agrimarket.agrimarket.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<Cart> addToCart(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        String productId = (String) body.get("productId");
        int quantity = (int) body.get("quantity");
        return ResponseEntity.ok(cartService.addToCart(userId, productId, quantity));
    }

    @PutMapping("/{userId}/update")
    public ResponseEntity<Cart> updateCartItem(@PathVariable String userId, @RequestBody Map<String, Object> body) {
        String productId = (String) body.get("productId");
        int quantity = (int) body.get("quantity");
        return ResponseEntity.ok(cartService.updateCartItem(userId, productId, quantity));
    }

    @DeleteMapping("/{userId}/remove/{productId}")
    public ResponseEntity<Cart> removeFromCart(@PathVariable String userId, @PathVariable String productId) {
        return ResponseEntity.ok(cartService.removeFromCart(userId, productId));
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<Cart> clearCart(@PathVariable String userId) {
        return ResponseEntity.ok(cartService.clearCart(userId));
    }
}
