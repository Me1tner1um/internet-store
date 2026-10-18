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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductFeignClient productClient;
    private final KafkaTemplate<String, OrderCreatedEvent> kafkaTemplate;

    public static final String ORDER_EVENTS_TOPIC = "order-events";

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest req, UUID userId, String userEmail) {
        log.info("Creating order for userId: {}, productId: {}, quantity: {}", userId, req.getProductId(), req.getQuantity());

        // 1. Sync: получаем товар из product-service
        ProductResponse product;
        try {
            product = productClient.getProduct(req.getProductId());
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Товар не найден: " + req.getProductId());
        }

        // 2. Проверяем остаток
        if (product.getStock() < req.getQuantity()) {
            throw new OutOfStockException(
                    "Запрошено " + req.getQuantity() + ", доступно " + product.getStock());
        }

        // 3. Сохраняем заказ (snapshot цены!)
        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .total(total)
                .build();
        order = orderRepository.save(order);

        OrderItem item = OrderItem.builder()
                .order(order)
                .productId(req.getProductId())
                .quantity(req.getQuantity())
                .price(product.getPrice()) // snapshot!
                .build();
        item = orderItemRepository.save(item);

        // 4. Sync: резервируем товар
        try {
            productClient.updateStock(req.getProductId(), new ReserveStockRequest(-req.getQuantity()));
        } catch (Exception e) {
            log.error("Не удалось зарезервировать товар: {}", e.getMessage());
            orderRepository.delete(order);
            throw new RuntimeException("Ошибка резервирования товара");
        }

        // 5. Async: публикуем событие в Kafka
        OrderCreatedEvent event = new OrderCreatedEvent(
                order.getId(),
                userId,
                product.getName(),
                req.getQuantity(),
                total,
                userEmail
        );
        kafkaTemplate.send(ORDER_EVENTS_TOPIC, order.getId().toString(), event);
        log.info("Заказ {} создан, событие отправлено в Kafka", order.getId());

        return OrderResponse.from(order, List.of(item), product.getName());
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrdersByUser(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        log.info("Order {} status updated to {}", id, newStatus);
        return OrderResponse.from(saved);
    }

    @Transactional
    public OrderResponse cancelOrder(UUID id, UUID userId) {
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Order is already cancelled");
        }

        // Restore stock in product-service
        for (OrderItem item : order.getItems()) {
            try {
                productClient.updateStock(item.getProductId(), new ReserveStockRequest(item.getQuantity()));
                log.info("Restored stock for product {}: quantity=+{}", item.getProductId(), item.getQuantity());
            } catch (Exception e) {
                log.error("Failed to restore stock for product {}: {}", item.getProductId(), e.getMessage());
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        log.info("Order {} cancelled by user {}", id, userId);
        return OrderResponse.from(saved);
    }
}
