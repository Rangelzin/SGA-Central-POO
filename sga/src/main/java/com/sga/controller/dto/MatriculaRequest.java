package com.sga.controller.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class MatriculaRequest {

    @NotNull(message = "ID do aluno é obrigatório")
    private UUID alunoId;

    @NotNull(message = "ID da turma é obrigatório")
    private UUID turmaId;
}
