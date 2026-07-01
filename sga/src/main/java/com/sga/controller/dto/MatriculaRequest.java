package com.sga.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Schema(description = "Dados para matricular um aluno em uma turma")
public class MatriculaRequest {

    @NotNull(message = "ID do aluno é obrigatório")
    @Schema(description = "ID do aluno", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID alunoId;

    @NotNull(message = "ID da turma é obrigatório")
    @Schema(description = "ID da turma", example = "550e8400-e29b-41d4-a716-446655440002")
    private UUID turmaId;
}
