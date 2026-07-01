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
@Schema(description = "Dados para criação ou atualização de professor")
public class ProfessorRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Schema(description = "Nome completo do professor", example = "Dra. Maria Souza")
    private String nome;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Schema(description = "E-mail institucional", example = "maria.souza@ufg.br")
    private String email;

    @NotBlank(message = "CPF é obrigatório")
    @Schema(description = "CPF sem formatação", example = "98765432100")
    private String cpf;

    @Schema(description = "Número de matrícula", example = "P202100001")
    private String matricula;

    @Schema(description = "Data de nascimento", example = "1975-03-15")
    private LocalDate dataNascimento;

    @NotBlank(message = "Titulação é obrigatória")
    @Schema(description = "Titulação acadêmica", example = "Doutorado")
    private String titulacao;

    @Schema(description = "Senha de acesso (será armazenada como hash)", example = "senha@123")
    private String senha;

    @NotNull(message = "Departamento é obrigatório")
    @Schema(description = "Referência ao departamento do professor")
    private DepartamentoIdRef departamento;
}
