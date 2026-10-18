package com.microshop.order.feign;

import com.microshop.order.dto.ProductResponse;
import com.microshop.order.dto.ReserveStockRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "product-service", url = "${product.service.url:http://localhost:8082}")
public interface ProductFeignClient {

    @GetMapping("/api/products/{id}")
    ProductResponse getProduct(@PathVariable("id") UUID id);

    @PatchMapping("/api/products/{id}/stock")
    void updateStock(@PathVariable("id") UUID id,
                     @RequestBody ReserveStockRequest request);
}
