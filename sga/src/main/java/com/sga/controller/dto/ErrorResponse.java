package com.sga.controller.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final Instant timestamp = Instant.now();
    private final int status;
    private final String erro;
    private final List<FieldError> campos;

    public ErrorResponse(int status, String erro) {
        this.status = status;
        this.erro = erro;
        this.campos = null;
    }

    public ErrorResponse(int status, String erro, List<FieldError> campos) {
        this.status = status;
        this.erro = erro;
        this.campos = campos;
    }

    public record FieldError(String campo, String mensagem) {}
}
