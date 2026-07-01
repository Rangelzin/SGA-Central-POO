package com.sga.controller.dto;

import com.sga.model.Matriculado;
import com.sga.model.enums.StatusMatricula;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Schema(description = "Dados de resposta de uma matrícula")
public class MatriculaResponse {

    @Schema(description = "ID da matrícula", example = "550e8400-e29b-41d4-a716-446655440010")
    private final UUID id;

    @Schema(description = "Status da matrícula", example = "ATIVA")
    private final StatusMatricula status;

    @Schema(description = "Média final calculada (0.0 a 10.0)", example = "7.5")
    private final BigDecimal nota;

    @Schema(description = "Frequência do aluno em percentual (0 a 100)", example = "85")
    private final Integer frequencia;

    @Schema(description = "Resumo do aluno matriculado")
    private final AlunoResumo aluno;

    @Schema(description = "Resumo da turma")
    private final TurmaResumo turma;

    public MatriculaResponse(Matriculado m) {
        this.id = m.getId();
        this.status = m.getStatus();
        this.nota = m.getNota();
        this.frequencia = m.getFrequencia();
        this.aluno = m.getAluno() != null
                ? new AlunoResumo(m.getAluno().getId(), m.getAluno().getNome())
                : null;
        this.turma = m.getTurma() != null
                ? new TurmaResumo(m.getTurma().getId(), m.getTurma().getCodigo())
                : null;
    }

    @Schema(description = "Resumo do aluno")
    public record AlunoResumo(
            @Schema(description = "ID", example = "550e8400-e29b-41d4-a716-446655440000") UUID id,
            @Schema(description = "Nome", example = "João Silva") String nome) {}

    @Schema(description = "Resumo da turma")
    public record TurmaResumo(
            @Schema(description = "ID", example = "550e8400-e29b-41d4-a716-446655440002") UUID id,
            @Schema(description = "Código", example = "INF001-2026.1-A") String codigo) {}
}
