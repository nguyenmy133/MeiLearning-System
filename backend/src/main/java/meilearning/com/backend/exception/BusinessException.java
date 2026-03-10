package meilearning.com.backend.exception;

/**
 * Ném khi vi phạm logic nghiệp vụ (422 Unprocessable Entity).
 * Ví dụ: xóa giáo viên đang phụ trách lớp, drop học viên đã inactive, v.v.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
