package com.agrimarket.agrimarket.service;

import com.agrimarket.agrimarket.exception.ResourceNotFoundException;
import com.agrimarket.agrimarket.model.Cart;
import com.agrimarket.agrimarket.model.CartItem;
import com.agrimarket.agrimarket.model.Product;
import com.agrimarket.agrimarket.repository.CartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductService productService;

    public Cart getCartByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().userId(userId).items(new ArrayList<>()).totalAmount(0.0).build();
                    return cartRepository.save(newCart);
                });
    }

    public Cart addToCart(String userId, String productId, int quantity) {
        Product product = productService.getProductById(productId);
        Cart cart = getCartByUserId(userId);

        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst();

        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            CartItem item = CartItem.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .imageUrl(product.getImages() != null && !product.getImages().isEmpty() ? product.getImages().get(0) : null)
                    .build();
            cart.getItems().add(item);
        }
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart updateCartItem(String userId, String productId, int quantity) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().stream()
                .filter(i -> i.getProductId().equals(productId))
                .findFirst()
                .ifPresent(i -> i.setQuantity(quantity));
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart removeFromCart(String userId, String productId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().removeIf(i -> i.getProductId().equals(productId));
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart clearCart(String userId) {
        Cart cart = getCartByUserId(userId);
        cart.getItems().clear();
        cart.setTotalAmount(0.0);
        return cartRepository.save(cart);
    }

    private void recalculate(Cart cart) {
        double total = cart.getItems().stream()
                .mapToDouble(i -> i.getUnitPrice() * i.getQuantity())
                .sum();
        cart.setTotalAmount(total);
    }
}
