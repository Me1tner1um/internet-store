package com.microshop.order.controller;

import com.microshop.order.dto.CreateOrderRequest;
import com.microshop.order.dto.OrderResponse;
import com.microshop.order.dto.UpdateOrderStatusRequest;
import com.microshop.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(
            @RequestBody @Valid CreateOrderRequest request,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        return orderService.createOrder(request, userId, userEmail);
    }

    @GetMapping
    public Page<OrderResponse> getMyOrders(
            @RequestHeader("X-User-Id") UUID userId,
            @PageableDefault(size = 20) Pageable pageable) {
        return orderService.getOrdersByUser(userId, pageable);
    }

    @GetMapping("/{id}")
    public OrderResponse getOrder(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        return orderService.getOrderById(id, userId);
    }

    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    public OrderResponse cancelOrder(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        return orderService.cancelOrder(id, userId);
    }
}
