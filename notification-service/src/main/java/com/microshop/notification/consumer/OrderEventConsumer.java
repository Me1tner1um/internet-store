package com.microshop.notification.consumer;

import com.microshop.notification.event.OrderCreatedEvent;
import com.microshop.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {

    private final EmailService emailService;

    @KafkaListener(
            topics = "order-events",
            groupId = "notification-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info("Received order created event: orderId={}, userId={}", event.orderId(), event.userId());
        try {
            emailService.sendOrderConfirmation(event);
        } catch (Exception e) {
            log.error("Error processing order created event for order {}: {}", event.orderId(), e.getMessage());
        }
    }
}
