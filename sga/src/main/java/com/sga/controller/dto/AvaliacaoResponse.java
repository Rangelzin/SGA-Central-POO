package com.sga.controller.dto;

import com.sga.model.Avalia;
import com.sga.model.enums.TipoAvaliacao;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Schema(description = "Dados de resposta de uma avaliação")
public class AvaliacaoResponse {

    @Schema(description = "ID da avaliação", example = "550e8400-e29b-41d4-a716-446655440020")
    private final UUID id;

    @Schema(description = "Nota obtida (0.0 a 10.0)", example = "8.5")
    private final BigDecimal nota;

    @Schema(description = "Peso na composição da média", example = "2.0")
    private final BigDecimal peso;

    @Schema(description = "Tipo da avaliação", example = "PROVA")
    private final TipoAvaliacao tipo;

    @Schema(description = "Descrição ou observações", example = "Prova 1 - Unidade 1")
    private final String descricao;

    @Schema(description = "ID da matrícula vinculada", example = "550e8400-e29b-41d4-a716-446655440010")
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
