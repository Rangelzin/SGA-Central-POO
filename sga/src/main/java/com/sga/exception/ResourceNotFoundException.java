package com.sga.exception;

/**
 * Lançada quando um recurso solicitado não existe (mapeável para HTTP 404).
 */
public class ResourceNotFoundException extends SgaException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String recurso, Object id) {
        super(recurso + " não encontrado(a): " + id);
    }
}
