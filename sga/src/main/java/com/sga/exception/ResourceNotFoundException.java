package com.sga.exception;

public class ResourceNotFoundException extends SgaException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String recurso, Object id) {
        super(recurso + " não encontrado(a): " + id);
    }
}
