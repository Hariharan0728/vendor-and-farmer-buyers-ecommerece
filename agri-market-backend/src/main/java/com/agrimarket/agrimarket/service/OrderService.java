package com.agrimarket.agrimarket.service;

import com.agrimarket.agrimarket.exception.BadRequestException;
import com.agrimarket.agrimarket.exception.ResourceNotFoundException;
import com.agrimarket.agrimarket.model.Cart;
import com.agrimarket.agrimarket.model.Order;
import com.agrimarket.agrimarket.model.OrderItem;
import com.agrimarket.agrimarket.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    public Order placeOrder(String userId, String paymentMode, com.agrimarket.agrimarket.model.Address shippingAddress) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty. Cannot place order.");
        }

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(ci -> OrderItem.builder()
                        .productId(ci.getProductId())
                        .productName(ci.getProductName())
                        .quantity(ci.getQuantity())
                        .unitPrice(ci.getUnitPrice())
                        .imageUrl(ci.getImageUrl())
                        .build())
                .collect(Collectors.toList());

        Order order = Order.builder()
                .userId(userId)
                .items(orderItems)
                .shippingAddress(shippingAddress)
                .paymentMode(paymentMode)
                .paymentStatus(paymentMode.equals("COD") ? "PENDING" : "PENDING")
                .orderStatus("PLACED")
                .totalAmount(cart.getTotalAmount())
                .build();

        Order saved = orderRepository.save(order);
        cartService.clearCart(userId);
        return saved;
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> getOrdersByVendorId(String vendorId) {
        return orderRepository.findByVendorId(vendorId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order getOrderById(String id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    public Order updateOrderStatus(String id, String status) {
        Order order = getOrderById(id);
        order.setOrderStatus(status);
        return orderRepository.save(order);
    }

    public Order cancelOrder(String id, String reason) {
        Order order = getOrderById(id);
        if (order.getOrderStatus().equals("SHIPPED") || order.getOrderStatus().equals("DELIVERED")) {
            throw new BadRequestException("Cannot cancel order that is already shipped or delivered.");
        }
        order.setOrderStatus("CANCELLED");
        order.setCancellationReason(reason);
        return orderRepository.save(order);
    }
}
