package com.microshop.product.service;

import com.microshop.product.dto.CreateProductRequest;
import com.microshop.product.dto.ProductResponse;
import com.microshop.product.exception.OutOfStockException;
import com.microshop.product.exception.ResourceNotFoundException;
import com.microshop.product.model.Product;
import com.microshop.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void updateStock_negativeDelta_reducesStock() {
        UUID id = UUID.randomUUID();
        Product product = Product.builder()
                .id(id)
                .name("Laptop")
                .price(new BigDecimal("999.00"))
                .stock(10)
                .build();

        when(productRepository.findById(id)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> inv.getArgument(0));

        productService.updateStock(id, -3);

        assertEquals(7, product.getStock());
        verify(productRepository).save(product);
    }

    @Test
    void updateStock_insufficientStock_throwsException() {
        UUID id = UUID.randomUUID();
        Product product = Product.builder()
                .id(id)
                .stock(2)
                .build();

        when(productRepository.findById(id)).thenReturn(Optional.of(product));

        assertThrows(OutOfStockException.class, () -> productService.updateStock(id, -5));
        verify(productRepository, never()).save(any());
    }

    @Test
    void updateStock_productNotFound_throwsException() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.updateStock(id, -1));
    }

    @Test
    void getById_success() {
        UUID id = UUID.randomUUID();
        Product product = Product.builder()
                .id(id)
                .name("Smartphone")
                .price(new BigDecimal("499.00"))
                .stock(5)
                .category("Electronics")
                .build();

        when(productRepository.findById(id)).thenReturn(Optional.of(product));

        ProductResponse response = productService.getById(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Smartphone", response.getName());
        assertEquals(new BigDecimal("499.00"), response.getPrice());
        assertEquals(5, response.getStock());
    }

    @Test
    void getById_notFound_throwsException() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getById(id));
    }

    @Test
    void createProduct_success() {
        CreateProductRequest req = new CreateProductRequest("Headphones", "Noise cancelling", new BigDecimal("199.00"), 15, "Audio");
        Product savedProduct = Product.builder()
                .id(UUID.randomUUID())
                .name("Headphones")
                .description("Noise cancelling")
                .price(new BigDecimal("199.00"))
                .stock(15)
                .category("Audio")
                .build();

        when(productRepository.save(any(Product.class))).thenReturn(savedProduct);

        ProductResponse response = productService.createProduct(req);

        assertNotNull(response);
        assertEquals("Headphones", response.getName());
        assertEquals(15, response.getStock());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void getAll_withCategory_callsFindByCategory() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        Product p = Product.builder().id(UUID.randomUUID()).name("Book").category("Books").price(new BigDecimal("15")).stock(20).build();
        when(productRepository.findByCategoryIgnoreCase("Books", pageRequest))
                .thenReturn(new PageImpl<>(List.of(p)));

        Page<ProductResponse> page = productService.getAll("Books", pageRequest);

        assertNotNull(page);
        assertEquals(1, page.getTotalElements());
        assertEquals("Book", page.getContent().get(0).getName());
    }
}
