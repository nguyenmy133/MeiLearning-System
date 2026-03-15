package com.meilearning.backend.exception;


public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String field, String value) {
        super(String.format("%s với %s '%s' đã tồn tại", resourceName, field, value));
    }



}



