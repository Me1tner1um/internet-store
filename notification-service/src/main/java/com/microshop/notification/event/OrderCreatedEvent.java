package com.microshop.notification.event;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderCreatedEvent(
    UUID orderId,
    UUID userId,
    String productName,
    int quantity,
    BigDecimal total,
    String userEmail
) {}
