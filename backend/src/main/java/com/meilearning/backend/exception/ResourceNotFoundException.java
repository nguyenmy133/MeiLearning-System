package com.meilearning.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * NĂ©m khi khĂ´ng tĂ¬m tháº¥y tĂ i nguyĂªn (404).
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(String.format("%s vá»›i ID %d khĂ´ng tá»“n táº¡i", resourceName, id));
    }
}
