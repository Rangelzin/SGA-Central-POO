package com.sga.controller.dto;

import com.sga.model.Turma;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
public class TurmaResponse {

    private final UUID id;
    private final String codigo;
    private final String horario;
    private final String localidade;
    private final Integer capacidade;
    private final LocalDate dataIn;
    private final LocalDate dataOut;
    private final DisciplinaResumo disciplina;
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

    public record DisciplinaResumo(Long id, String codigo) {}
    public record ProfessorResumo(java.util.UUID id, String nome) {}
}
