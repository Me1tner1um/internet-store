package com.microshop.order.service;

import com.microshop.order.dto.CreateOrderRequest;
import com.microshop.order.dto.OrderResponse;
import com.microshop.order.dto.ProductResponse;
import com.microshop.order.dto.ReserveStockRequest;
import com.microshop.order.event.OrderCreatedEvent;
import com.microshop.order.exception.OutOfStockException;
import com.microshop.order.exception.ResourceNotFoundException;
import com.microshop.order.feign.ProductFeignClient;
import com.microshop.order.model.Order;
import com.microshop.order.model.OrderItem;
import com.microshop.order.model.OrderStatus;
import com.microshop.order.repository.OrderItemRepository;
import com.microshop.order.repository.OrderRepository;
import feign.FeignException;
import feign.Request;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private ProductFeignClient productClient;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    @InjectMocks
    private OrderService orderService;

    @Test
    void createOrder_success_publishesKafkaEvent() {
        // arrange
        UUID productId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ProductResponse product = new ProductResponse(
                productId, "Laptop", new BigDecimal("1499.00"), 10);
        when(productClient.getProduct(productId)).thenReturn(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });
        when(orderItemRepository.save(any(OrderItem.class))).thenAnswer(inv -> {
            OrderItem i = inv.getArgument(0);
            i.setId(UUID.randomUUID());
            return i;
        });

        // act
        CreateOrderRequest req = new CreateOrderRequest(productId, 2);
        OrderResponse response = orderService.createOrder(req, userId, "user@test.com");

        // assert
        assertNotNull(response);
        assertEquals(new BigDecimal("2998.00"), response.getTotal());
        assertEquals(OrderStatus.PENDING, response.getStatus());
        verify(productClient).updateStock(eq(productId),
                argThat(r -> r.getQuantity() == -2));
        verify(kafkaTemplate).send(eq("order-events"), anyString(),
                any(OrderCreatedEvent.class));
    }

    @Test
    void createOrder_outOfStock_throwsException() {
        UUID productId = UUID.randomUUID();
        ProductResponse product = new ProductResponse(
                productId, "Laptop", new BigDecimal("1499.00"), 1); // only 1 in stock
        when(productClient.getProduct(productId)).thenReturn(product);

        CreateOrderRequest req = new CreateOrderRequest(productId, 5); // requested 5
        assertThrows(OutOfStockException.class,
                () -> orderService.createOrder(req, UUID.randomUUID(), "u@test.com"));

        // Kafka should never receive event
        verify(kafkaTemplate, never()).send(any(), any(), any());
        verify(productClient, never()).updateStock(any(), any());
    }

    @Test
    void createOrder_productNotFound_throwsException() {
        UUID productId = UUID.randomUUID();
        FeignException.NotFound feignNotFound = mock(FeignException.NotFound.class);
        when(productClient.getProduct(productId)).thenThrow(feignNotFound);

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.createOrder(
                        new CreateOrderRequest(productId, 1),
                        UUID.randomUUID(), "u@test.com"));

        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    void createOrder_stockUpdateFails_rollsBackOrder() {
        UUID productId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        ProductResponse product = new ProductResponse(
                productId, "Tablet", new BigDecimal("500.00"), 10);
        when(productClient.getProduct(productId)).thenReturn(product);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(UUID.randomUUID());
            return o;
        });

        doThrow(new RuntimeException("Network timeout")).when(productClient).updateStock(eq(productId), any());

        CreateOrderRequest req = new CreateOrderRequest(productId, 1);
        assertThrows(RuntimeException.class, () -> orderService.createOrder(req, userId, "u@test.com"));

        // Verify order is deleted on rollback
        verify(orderRepository).delete(any(Order.class));
        verify(kafkaTemplate, never()).send(any(), any(), any());
    }

    @Test
    void cancelOrder_restoresStock() {
        UUID orderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        Order order = Order.builder()
                .id(orderId)
                .userId(userId)
                .status(OrderStatus.PENDING)
                .total(new BigDecimal("100.00"))
                .items(new ArrayList<>())
                .build();
        OrderItem item = OrderItem.builder()
                .id(UUID.randomUUID())
                .order(order)
                .productId(productId)
                .quantity(3)
                .price(new BigDecimal("100.00"))
                .build();
        order.getItems().add(item);

        when(orderRepository.findByIdAndUserId(orderId, userId)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        OrderResponse cancelled = orderService.cancelOrder(orderId, userId);

        assertNotNull(cancelled);
        assertEquals(OrderStatus.CANCELLED, cancelled.getStatus());
        verify(productClient).updateStock(eq(productId), argThat(r -> r.getQuantity() == 3));
    }
}
