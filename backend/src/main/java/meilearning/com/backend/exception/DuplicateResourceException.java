package meilearning.com.backend.exception;

/**
 * Ném khi tạo tài nguyên bị trùng (409 Conflict).
 * Ví dụ: email đã tồn tại, username đã được sử dụng, v.v.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String field, String value) {
        super(String.format("%s với %s '%s' đã tồn tại", resourceName, field, value));
    }
}
