package com.sga.exception;

/**
 * Exceção base do domínio SGA.
 * <p>
 * Todas as exceções de regra de negócio herdam desta classe, permitindo que a
 * camada web (ALTA-4) mapeie cada subtipo para um código HTTP através de um
 * {@code @ControllerAdvice} global.
 */
public abstract class SgaException extends RuntimeException {

    protected SgaException(String message) {
        super(message);
    }
}
