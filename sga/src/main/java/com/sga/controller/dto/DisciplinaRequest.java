package com.sga.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Schema(description = "Dados para criação ou atualização de disciplina")
public class DisciplinaRequest {

    @NotBlank(message = "Código é obrigatório")
    @Schema(description = "Código único da disciplina", example = "INF001")
    private String codigo;

    @Schema(description = "Tipo: OBRIGATORIA, OPTATIVA ou NUCLEO_LIVRE", example = "OBRIGATORIA")
    private String tipo;

    @NotNull(message = "Carga horária é obrigatória")
    @Positive(message = "Carga horária deve ser maior que zero")
    @Schema(description = "Carga horária em horas", example = "60")
    private Integer cargaHoraria;

    @Schema(description = "Código da disciplina pré-requisito (opcional)", example = "INF000")
    private String preRequisito;

    @NotNull(message = "Departamento é obrigatório")
    @Schema(description = "Referência ao departamento responsável")
    private DepartamentoIdRef departamento;
}
