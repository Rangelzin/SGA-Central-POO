package com.sga.controller.dto;

import com.sga.model.Departamento;
import lombok.Getter;

@Getter
public class DepartamentoResponse {

    private final Long id;
    private final String sigla;
    private final String nome;

    public DepartamentoResponse(Departamento dep) {
        this.id = dep.getId();
        this.sigla = dep.getSigla();
        this.nome = dep.getNome();
    }
}
