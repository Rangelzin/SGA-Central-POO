package com.sga.controller.dto;

import com.sga.model.enums.TipoAvaliacao;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
public class NotaRequest {

    @NotNull(message = "ID da matrícula é obrigatório")
    private UUID matriculadoId;

    @NotNull(message = "Nota é obrigatória")
    @DecimalMin(value = "0.0", message = "Nota mínima é 0")
    @DecimalMax(value = "10.0", message = "Nota máxima é 10")
    private BigDecimal nota;

    private BigDecimal peso;

    @NotNull(message = "Tipo de avaliação é obrigatório")
    private TipoAvaliacao tipo;

    private String descricao;
}
