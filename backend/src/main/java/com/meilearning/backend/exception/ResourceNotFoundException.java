package com.meilearning.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**

 * N©m khi không tìm thấy tài nguyªn (404).

 */

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {

        super(message);

    }

    public ResourceNotFoundException(String resourceName, Long id) {

        super(String.format("%s với ID %d không tồn tại", resourceName, id));

    }

}
