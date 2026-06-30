package com.sga.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisciplinaRequest {

    @NotBlank(message = "Código é obrigatório")
    private String codigo;

    private String tipo;

    @NotNull(message = "Carga horária é obrigatória")
    @Positive(message = "Carga horária deve ser maior que zero")
    private Integer cargaHoraria;

    private String preRequisito;

    @NotNull(message = "Departamento é obrigatório")
    private DepartamentoIdRef departamento;
}
