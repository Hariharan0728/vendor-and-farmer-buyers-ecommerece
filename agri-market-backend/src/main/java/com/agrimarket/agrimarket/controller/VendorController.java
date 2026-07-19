package com.agrimarket.agrimarket.controller;

import com.agrimarket.agrimarket.model.Vendor;
import com.agrimarket.agrimarket.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/vendors")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Vendor> registerVendor(@RequestBody Vendor vendor) {
        return ResponseEntity.ok(vendorService.registerVendor(vendor));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Vendor> getMyVendorProfile(@RequestParam String userId) {
        return ResponseEntity.ok(vendorService.getVendorByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable String id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> approveVendor(@PathVariable String id) {
        return ResponseEntity.ok(vendorService.approveVendor(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> rejectVendor(@PathVariable String id) {
        return ResponseEntity.ok(vendorService.rejectVendor(id));
    }
}
