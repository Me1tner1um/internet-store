package com.microshop.notification.consumer;

import com.microshop.notification.event.OrderCreatedEvent;
import com.microshop.notification.service.EmailService;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

@SpringBootTest
@DirtiesContext
@EmbeddedKafka(
        partitions = 1,
        topics = {"order-events"}
)
@TestPropertySource(properties = {
        "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}"
})
@Import(OrderEventConsumerIntegrationTest.TestKafkaConfig.class)
class OrderEventConsumerIntegrationTest {

    @TestConfiguration
    static class TestKafkaConfig {
        @Bean
        public ProducerFactory<String, OrderCreatedEvent> testProducerFactory(
                @Value("${spring.embedded.kafka.brokers}") String brokers) {
            Map<String, Object> config = new HashMap<>();
            config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers);
            config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
            config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
            return new DefaultKafkaProducerFactory<>(config);
        }

        @Bean
        public KafkaTemplate<String, OrderCreatedEvent> testKafkaTemplate(
                ProducerFactory<String, OrderCreatedEvent> pf) {
            return new KafkaTemplate<>(pf);
        }
    }

    @Autowired
    private KafkaTemplate<String, OrderCreatedEvent> testKafkaTemplate;

    @MockBean
    private EmailService emailService;

    @Test
    void whenOrderEventPublished_emailServiceIsCalled() {
        UUID orderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        OrderCreatedEvent event = new OrderCreatedEvent(
                orderId,
                userId,
                "Laptop Pro 16",
                1,
                new BigDecimal("1999.00"),
                "test@example.com"
        );

        testKafkaTemplate.send("order-events", orderId.toString(), event);

        // Verify that the consumer asynchronously triggers EmailService
        verify(emailService, timeout(10000).times(1)).sendOrderConfirmation(any(OrderCreatedEvent.class));
    }
}
