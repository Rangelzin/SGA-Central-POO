package com.sga.controller.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DepartamentoIdRef {
    @NotNull
    private Long id;
}
