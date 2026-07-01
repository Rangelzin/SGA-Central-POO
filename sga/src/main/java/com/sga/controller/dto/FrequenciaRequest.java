package com.sga.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Schema(description = "Dados para registrar frequência de um aluno matriculado")
public class FrequenciaRequest {

    @NotNull(message = "ID da matrícula é obrigatório")
    @Schema(description = "ID da matrícula (Matriculado)", example = "550e8400-e29b-41d4-a716-446655440010")
    private UUID matriculadoId;

    @NotNull(message = "Frequência é obrigatória")
    @Min(value = 0, message = "Frequência mínima é 0")
    @Max(value = 100, message = "Frequência máxima é 100")
    @Schema(description = "Percentual de frequência do aluno (0 a 100)", example = "85")
    private Integer frequencia;
}
