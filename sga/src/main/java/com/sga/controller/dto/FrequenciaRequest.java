package com.sga.controller.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class FrequenciaRequest {

    @NotNull(message = "ID da matrícula é obrigatório")
    private UUID matriculadoId;

    @NotNull(message = "Frequência é obrigatória")
    @Min(value = 0, message = "Frequência mínima é 0")
    @Max(value = 100, message = "Frequência máxima é 100")
    private Integer frequencia;
}
