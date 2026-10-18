package com.microshop.order.dto;

import com.microshop.order.model.Order;
import com.microshop.order.model.OrderItem;
import com.microshop.order.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;
    private UUID userId;
    private OrderStatus status;
    private BigDecimal total;
    private List<OrderItemResponse> items;
    private Instant createdAt;

    public static OrderResponse from(Order order, List<OrderItem> items, String productName) {
        List<OrderItemResponse> itemResponses = items.stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(productName)
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .total(order.getTotal())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null ?
                order.getItems().stream()
                        .map(item -> OrderItemResponse.builder()
                                .id(item.getId())
                                .productId(item.getProductId())
                                .quantity(item.getQuantity())
                                .price(item.getPrice())
                                .build())
                        .collect(Collectors.toList()) :
                Collections.emptyList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus())
                .total(order.getTotal())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
