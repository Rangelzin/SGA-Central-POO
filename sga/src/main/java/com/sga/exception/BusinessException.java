package com.sga.exception;

/**
 * Lançada quando uma regra de negócio ou validação é violada
 * (mapeável para HTTP 400 / 422).
 */
public class BusinessException extends SgaException {

    public BusinessException(String message) {
        super(message);
    }
}
