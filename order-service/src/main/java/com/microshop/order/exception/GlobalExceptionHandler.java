package com.microshop.order.exception;

import com.microshop.order.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(OutOfStockException.class)
    public ResponseEntity<ErrorResponse> handleOutOfStock(OutOfStockException ex) {
        log.warn("Out of stock: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                ErrorResponse.builder()
                        .error("OUT_OF_STOCK")
                        .message(ex.getMessage())
                        .status(HttpStatus.CONFLICT.value())
                        .build()
        );
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ErrorResponse.builder()
                        .error("NOT_FOUND")
                        .message(ex.getMessage())
                        .status(HttpStatus.NOT_FOUND.value())
                        .build()
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        log.warn("Illegal state: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                        .error("BAD_REQUEST")
                        .message(ex.getMessage())
                        .status(HttpStatus.BAD_REQUEST.value())
                        .build()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        log.warn("Validation error: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                ErrorResponse.builder()
                        .error("VALIDATION_ERROR")
                        .message(message)
                        .status(HttpStatus.BAD_REQUEST.value())
                        .build()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ErrorResponse.builder()
                        .error("INTERNAL_SERVER_ERROR")
                        .message(ex.getMessage())
                        .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                        .build()
        );
    }
}
