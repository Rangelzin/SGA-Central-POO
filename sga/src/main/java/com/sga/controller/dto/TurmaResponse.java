package com.sga.controller.dto;

import com.sga.model.Turma;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Schema(description = "Dados de resposta de uma turma")
public class TurmaResponse {

    @Schema(description = "ID único da turma", example = "550e8400-e29b-41d4-a716-446655440002")
    private final UUID id;

    @Schema(description = "Código da turma", example = "INF001-2026.1-A")
    private final String codigo;

    @Schema(description = "Horário das aulas", example = "Seg/Qua 08:00-10:00")
    private final String horario;

    @Schema(description = "Localidade/sala", example = "Sala 205 - Bloco A")
    private final String localidade;

    @Schema(description = "Capacidade máxima (null = ilimitada)", example = "40")
    private final Integer capacidade;

    @Schema(description = "Data de início", example = "2026-03-01")
    private final LocalDate dataIn;

    @Schema(description = "Data de encerramento", example = "2026-07-15")
    private final LocalDate dataOut;

    @Schema(description = "Disciplina vinculada")
    private final DisciplinaResumo disciplina;

    @Schema(description = "Professor responsável")
    private final ProfessorResumo professor;

    public TurmaResponse(Turma turma) {
        this.id = turma.getId();
        this.codigo = turma.getCodigo();
        this.horario = turma.getHorario();
        this.localidade = turma.getLocalidade();
        this.capacidade = turma.getCapacidade();
        this.dataIn = turma.getDataIn();
        this.dataOut = turma.getDataOut();
        this.disciplina = turma.getDisciplina() != null
                ? new DisciplinaResumo(turma.getDisciplina().getId(), turma.getDisciplina().getCodigo())
                : null;
        this.professor = turma.getProfessor() != null
                ? new ProfessorResumo(turma.getProfessor().getId(), turma.getProfessor().getNome())
                : null;
    }

    @Schema(description = "Resumo da disciplina")
    public record DisciplinaResumo(
            @Schema(description = "ID", example = "1") Long id,
            @Schema(description = "Código", example = "INF001") String codigo) {}

    @Schema(description = "Resumo do professor")
    public record ProfessorResumo(
            @Schema(description = "ID", example = "550e8400-e29b-41d4-a716-446655440001") java.util.UUID id,
            @Schema(description = "Nome", example = "Dra. Maria Souza") String nome) {}
}
