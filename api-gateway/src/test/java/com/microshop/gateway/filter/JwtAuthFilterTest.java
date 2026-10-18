package com.microshop.gateway.filter;

import com.microshop.gateway.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private GatewayFilterChain chain;

    @InjectMocks
    private JwtAuthFilter jwtAuthFilter;

    @Test
    void filter_publicAuthPath_bypassesAuth() {
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void filter_publicGetProducts_bypassesAuth() {
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        MockServerHttpRequest request = MockServerHttpRequest.method(HttpMethod.GET, "/api/products").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain).filter(exchange);
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void filter_protectedPath_noAuthHeader_returns401() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/orders").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verify(chain, never()).filter(any());
    }

    @Test
    void filter_protectedPath_invalidToken_returns401() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        when(jwtUtil.validateToken("invalid-token")).thenReturn(false);

        jwtAuthFilter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verify(chain, never()).filter(any());
    }

    @Test
    void filter_protectedPath_validToken_addsHeadersAndProceeds() {
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtUtil.validateToken("valid-token")).thenReturn(true);
        when(jwtUtil.extractUserId("valid-token")).thenReturn("user-uuid-123");
        when(jwtUtil.extractRole("valid-token")).thenReturn("ROLE_USER");
        when(jwtUtil.extractEmail("valid-token")).thenReturn("user@test.com");

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain).filter(argThat(ex -> {
            HttpHeaders headers = ex.getRequest().getHeaders();
            return "user-uuid-123".equals(headers.getFirst("X-User-Id")) &&
                   "ROLE_USER".equals(headers.getFirst("X-User-Role")) &&
                   "user@test.com".equals(headers.getFirst("X-User-Email"));
        }));
    }
}
