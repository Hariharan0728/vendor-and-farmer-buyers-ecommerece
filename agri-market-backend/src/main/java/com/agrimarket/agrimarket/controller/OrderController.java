package com.agrimarket.agrimarket.controller;

import com.agrimarket.agrimarket.dto.PlaceOrderRequest;
import com.agrimarket.agrimarket.model.Order;
import com.agrimarket.agrimarket.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place/{userId}")
    public ResponseEntity<Order> placeOrder(@PathVariable String userId, @RequestBody PlaceOrderRequest req) {
        return ResponseEntity.ok(orderService.placeOrder(userId, req.getPaymentMode(), req.getShippingAddress()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<Order>> getOrdersByVendor(@PathVariable String vendorId) {
        return ResponseEntity.ok(orderService.getOrdersByVendorId(vendorId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable String id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, body.get("status")));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.cancelOrder(id, body.getOrDefault("reason", "")));
    }
}
