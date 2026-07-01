package com.sga.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Schema(description = "Dados para criação ou atualização de turma")
public class TurmaRequest {

    @NotBlank(message = "Código é obrigatório")
    @Schema(description = "Código único da turma", example = "INF001-2026.1-A")
    private String codigo;

    @Schema(description = "Horário das aulas", example = "Seg/Qua 08:00-10:00")
    private String horario;

    @Schema(description = "Localidade/sala", example = "Sala 205 - Bloco A")
    private String localidade;

    @Positive(message = "Capacidade deve ser maior que zero")
    @Schema(description = "Capacidade máxima de alunos (null = ilimitada)", example = "40")
    private Integer capacidade;

    @Schema(description = "Data de início da turma", example = "2026-03-01")
    private LocalDate dataIn;

    @Schema(description = "Data de encerramento da turma", example = "2026-07-15")
    private LocalDate dataOut;

    @NotNull(message = "Disciplina é obrigatória")
    @Schema(description = "Referência à disciplina")
    private DisciplinaIdRef disciplina;

    @NotNull(message = "Professor é obrigatório")
    @Schema(description = "Referência ao professor responsável")
    private ProfessorIdRef professor;

    @Getter
    @Setter
    @Schema(description = "Referência por ID a uma disciplina")
    public static class DisciplinaIdRef {
        @NotNull
        @Schema(description = "ID da disciplina", example = "1")
        private Long id;
    }

    @Getter
    @Setter
    @Schema(description = "Referência por ID a um professor")
    public static class ProfessorIdRef {
        @NotNull
        @Schema(description = "ID do professor", example = "550e8400-e29b-41d4-a716-446655440001")
        private UUID id;
    }
}
