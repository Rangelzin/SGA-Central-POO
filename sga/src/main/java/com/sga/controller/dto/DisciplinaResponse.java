package com.sga.controller.dto;

import com.sga.model.Disciplina;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "Dados de resposta de uma disciplina")
public class DisciplinaResponse {

    @Schema(description = "ID da disciplina", example = "1")
    private final Long id;

    @Schema(description = "Código único", example = "INF001")
    private final String codigo;

    @Schema(description = "Tipo: OBRIGATORIA, OPTATIVA ou NUCLEO_LIVRE", example = "OBRIGATORIA")
    private final String tipo;

    @Schema(description = "Carga horária em horas", example = "60")
    private final Integer cargaHoraria;

    @Schema(description = "Código do pré-requisito", example = "INF000")
    private final String preRequisito;

    @Schema(description = "Indica se a disciplina está ativa", example = "true")
    private final boolean ativo;

    @Schema(description = "Departamento responsável")
    private final DepartamentoResponse departamento;

    public DisciplinaResponse(Disciplina disciplina) {
        this.id = disciplina.getId();
        this.codigo = disciplina.getCodigo();
        this.tipo = disciplina.getTipo();
        this.cargaHoraria = disciplina.getCargaHoraria();
        this.preRequisito = disciplina.getPreRequisito();
        this.ativo = disciplina.isAtivo();
        this.departamento = disciplina.getDepartamento() != null
                ? new DepartamentoResponse(disciplina.getDepartamento())
                : null;
    }
}
