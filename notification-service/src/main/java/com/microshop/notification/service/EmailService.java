package com.microshop.notification.service;

import com.microshop.notification.event.OrderCreatedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendOrderConfirmation(OrderCreatedEvent event) {
        log.info("=== EMAIL CONFIRMATION ===");
        log.info("To: {}", event.userEmail());
        log.info("Subject: Order #{} Confirmed", event.orderId());
        log.info("Product: {} x {}", event.productName(), event.quantity());
        log.info("Total: {}", event.total());
        log.info("===========================");
    }
}
