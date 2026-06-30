package com.sga.controller.dto;

import com.sga.model.Matriculado;
import com.sga.model.enums.StatusMatricula;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
public class MatriculaResponse {

    private final UUID id;
    private final StatusMatricula status;
    private final BigDecimal nota;
    private final Integer frequencia;
    private final AlunoResumo aluno;
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

    public record AlunoResumo(UUID id, String nome) {}
    public record TurmaResumo(UUID id, String codigo) {}
}
