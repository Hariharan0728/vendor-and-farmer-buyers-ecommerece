package com.agrimarket.agrimarket.service;

import com.agrimarket.agrimarket.exception.BadRequestException;
import com.agrimarket.agrimarket.exception.ResourceNotFoundException;
import com.agrimarket.agrimarket.model.Vendor;
import com.agrimarket.agrimarket.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    public Vendor registerVendor(Vendor vendor) {
        if (vendorRepository.existsByUserId(vendor.getUserId())) {
            throw new BadRequestException("Vendor profile already exists for this user.");
        }
        vendor.setKycStatus("PENDING");
        vendor.setRating(0.0);
        return vendorRepository.save(vendor);
    }

    public Vendor getVendorByUserId(String userId) {
        return vendorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found for user: " + userId));
    }

    public Vendor getVendorById(String id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found: " + id));
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Vendor approveVendor(String id) {
        Vendor vendor = getVendorById(id);
        vendor.setKycStatus("APPROVED");
        return vendorRepository.save(vendor);
    }

    public Vendor rejectVendor(String id) {
        Vendor vendor = getVendorById(id);
        vendor.setKycStatus("REJECTED");
        return vendorRepository.save(vendor);
    }
}
