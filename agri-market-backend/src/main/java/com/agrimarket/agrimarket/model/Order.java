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
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String vendorId;

    private List<OrderItem> items;

    private Address shippingAddress;

    private String paymentMode;   // ONLINE, COD, WALLET
    private String paymentStatus; // PENDING, PAID, FAILED, REFUNDED
    private String razorpayOrderId;
    private String razorpayPaymentId;

    // PLACED, CONFIRMED, PACKED, SHIPPED, DELIVERED, CANCELLED, RETURNED
    private String orderStatus;

    private Double totalAmount;
    private String trackingId;
    private String courierName;
    private String cancellationReason;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
