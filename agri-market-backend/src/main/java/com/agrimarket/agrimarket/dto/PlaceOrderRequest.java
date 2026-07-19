package com.agrimarket.agrimarket.dto;

import com.agrimarket.agrimarket.model.Address;
import lombok.Data;

@Data
public class PlaceOrderRequest {
    private String paymentMode;
    private Address shippingAddress;
}
