package com.microshop.product.controller;

import com.microshop.product.dto.CreateProductRequest;
import com.microshop.product.dto.ProductResponse;
import com.microshop.product.dto.ReserveStockRequest;
import com.microshop.product.dto.UpdateProductRequest;
import com.microshop.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Page<ProductResponse> getAllProducts(
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        return productService.getAll(category, pageable);
    }

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable UUID id) {
        return productService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody CreateProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/{id}")
    public ProductResponse updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
    }

    @RequestMapping(value = "/{id}/stock", method = {RequestMethod.PATCH, RequestMethod.PUT})
    @ResponseStatus(HttpStatus.OK)
    public void updateStock(
            @PathVariable UUID id,
            @Valid @RequestBody ReserveStockRequest request) {
        productService.updateStock(id, request.getQuantity());
    }
}
