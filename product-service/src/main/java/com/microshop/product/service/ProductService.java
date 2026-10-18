package com.microshop.product.service;

import com.microshop.product.dto.CreateProductRequest;
import com.microshop.product.dto.ProductResponse;
import com.microshop.product.dto.UpdateProductRequest;
import com.microshop.product.exception.OutOfStockException;
import com.microshop.product.exception.ResourceNotFoundException;
import com.microshop.product.model.Product;
import com.microshop.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public void updateStock(UUID productId, int delta) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        int newStock = product.getStock() + delta;
        if (newStock < 0) {
            throw new OutOfStockException(
                    "Недостаточно товара. Текущий остаток: " + product.getStock());
        }
        product.setStock(newStock);
        productRepository.save(product);
        log.info("Updated stock for product {}: delta={}, newStock={}", productId, delta, newStock);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAll(String category, Pageable pageable) {
        if (category != null && !category.trim().isEmpty()) {
            return productRepository.findByCategoryIgnoreCase(category.trim(), pageable)
                    .map(ProductResponse::from);
        }
        return productRepository.findAll(pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        return productRepository.findById(id)
                .map(ProductResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Transactional
    public ProductResponse createProduct(CreateProductRequest req) {
        Product product = Product.builder()
                .name(req.getName())
                .description(req.getDescription())
                .price(req.getPrice())
                .stock(req.getStock())
                .category(req.getCategory())
                .build();
        Product saved = productRepository.save(product);
        log.info("Created product {} with id: {}", saved.getName(), saved.getId());
        return ProductResponse.from(saved);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, UpdateProductRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setStock(req.getStock());
        product.setCategory(req.getCategory());

        Product updated = productRepository.save(product);
        log.info("Updated product with id: {}", id);
        return ProductResponse.from(updated);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        productRepository.deleteById(id);
        log.info("Deleted product with id: {}", id);
    }
}
