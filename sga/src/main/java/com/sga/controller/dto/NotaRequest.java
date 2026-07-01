package com.sga.controller.dto;

import com.sga.model.enums.TipoAvaliacao;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Schema(description = "Dados para registrar uma nota de avaliação")
public class NotaRequest {

    @NotNull(message = "ID da matrícula é obrigatório")
    @Schema(description = "ID da matrícula (Matriculado)", example = "550e8400-e29b-41d4-a716-446655440010")
    private UUID matriculadoId;

    @NotNull(message = "Nota é obrigatória")
    @DecimalMin(value = "0.0", message = "Nota mínima é 0")
    @DecimalMax(value = "10.0", message = "Nota máxima é 10")
    @Schema(description = "Nota da avaliação (0.0 a 10.0)", example = "8.5")
    private BigDecimal nota;

    @Schema(description = "Peso da avaliação na média (opcional)", example = "2.0")
    private BigDecimal peso;

    @NotNull(message = "Tipo de avaliação é obrigatório")
    @Schema(description = "Tipo da avaliação", example = "PROVA")
    private TipoAvaliacao tipo;

    @Schema(description = "Descrição ou observações sobre a avaliação", example = "Prova 1 - Unidade 1")
    private String descricao;
}
