package com.meilearning.backend.exception;

/**
 * NĂ©m khi vi pháº¡m logic nghiá»‡p vá»¥ (422 Unprocessable Entity).
 * VĂ­ dá»¥: xĂ³a giĂ¡o viĂªn Ä‘ang phá»¥ trĂ¡ch lá»›p, drop há»c viĂªn Ä‘Ă£ inactive, v.v.
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
