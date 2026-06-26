package com.sga.exception;

public abstract class SgaException extends RuntimeException {

    protected SgaException(String message) {
        super(message);
    }
}
