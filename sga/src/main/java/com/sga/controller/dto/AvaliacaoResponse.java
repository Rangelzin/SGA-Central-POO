package com.sga.controller.dto;

import com.sga.model.Avalia;
import com.sga.model.enums.TipoAvaliacao;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class AvaliacaoResponse {

    private final UUID id;
    private final BigDecimal nota;
    private final BigDecimal peso;
    private final TipoAvaliacao tipo;
    private final String descricao;
    private final UUID matriculadoId;

    public AvaliacaoResponse(Avalia avalia) {
        this.id = avalia.getId();
        this.nota = avalia.getNota();
        this.peso = avalia.getPeso();
        this.tipo = avalia.getTipo();
        this.descricao = avalia.getDescricao();
        this.matriculadoId = avalia.getMatriculado() != null ? avalia.getMatriculado().getId() : null;
    }
}
