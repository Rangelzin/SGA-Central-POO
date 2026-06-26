package com.sga.exception;

/**
 * Lançada quando uma operação conflita com o estado atual, tipicamente uma
 * violação de unicidade como e-mail ou CPF já cadastrado
 * (mapeável para HTTP 409).
 */
public class ConflictException extends SgaException {

    public ConflictException(String message) {
        super(message);
    }
}
