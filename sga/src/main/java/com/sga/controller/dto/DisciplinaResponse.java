package com.sga.controller.dto;

import com.sga.model.Disciplina;
import lombok.Getter;

@Getter
public class DisciplinaResponse {

    private final Long id;
    private final String codigo;
    private final String tipo;
    private final Integer cargaHoraria;
    private final String preRequisito;
    private final boolean ativo;
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
