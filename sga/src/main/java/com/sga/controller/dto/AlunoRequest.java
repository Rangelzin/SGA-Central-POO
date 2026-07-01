package com.sga.controller.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Schema(description = "Dados para criação ou atualização de aluno")
public class AlunoRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Schema(description = "Nome completo do aluno", example = "João Silva")
    private String nome;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Schema(description = "E-mail institucional", example = "joao.silva@ufg.br")
    private String email;

    @NotBlank(message = "CPF é obrigatório")
    @Schema(description = "CPF sem formatação", example = "12345678900")
    private String cpf;

    @Schema(description = "Número de matrícula", example = "202100001")
    private String matricula;

    @Schema(description = "Data de nascimento", example = "2000-05-20")
    private LocalDate dataNascimento;

    @Schema(description = "Senha de acesso (será armazenada como hash)", example = "senha@123")
    private String senha;

    @NotNull(message = "Departamento é obrigatório")
    @Schema(description = "Referência ao departamento do aluno")
    private DepartamentoIdRef departamento;
}
