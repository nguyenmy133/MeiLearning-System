package com.meilearning.backend.exception;

/**
 * NĂ©m khi táº¡o tĂ i nguyĂªn bá»‹ trĂ¹ng (409 Conflict).
 * VĂ­ dá»¥: email Ä‘Ă£ tá»“n táº¡i, username Ä‘Ă£ Ä‘Æ°á»£c sá»­ dá»¥ng, v.v.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String resourceName, String field, String value) {
        super(String.format("%s vá»›i %s '%s' Ä‘Ă£ tá»“n táº¡i", resourceName, field, value));
    }
}
