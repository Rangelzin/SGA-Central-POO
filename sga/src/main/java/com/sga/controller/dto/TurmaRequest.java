package com.sga.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class TurmaRequest {

    @NotBlank(message = "Código é obrigatório")
    private String codigo;

    private String horario;
    private String localidade;

    @Positive(message = "Capacidade deve ser maior que zero")
    private Integer capacidade;

    private LocalDate dataIn;
    private LocalDate dataOut;

    @NotNull(message = "Disciplina é obrigatória")
    private DisciplinaIdRef disciplina;

    @NotNull(message = "Professor é obrigatório")
    private ProfessorIdRef professor;

    @Getter
    @Setter
    public static class DisciplinaIdRef {
        @NotNull
        private Long id;
    }

    @Getter
    @Setter
    public static class ProfessorIdRef {
        @NotNull
        private UUID id;
    }
}
