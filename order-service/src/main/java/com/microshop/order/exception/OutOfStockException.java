package com.microshop.order.exception;

public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String message) {
        super(message);
    }
}
