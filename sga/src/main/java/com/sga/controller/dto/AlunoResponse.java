package com.sga.controller.dto;

import com.sga.model.Aluno;
import com.sga.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Schema(description = "Dados de resposta de um aluno")
public class AlunoResponse {

    @JsonProperty("uuid")
    @Schema(description = "ID único do aluno", example = "550e8400-e29b-41d4-a716-446655440000")
    private final UUID id;

    @JsonProperty("name")
    @Schema(description = "Nome completo", example = "João Silva")
    private final String nome;

    @JsonProperty("email")
    @Schema(description = "E-mail institucional", example = "joao.silva@ufg.br")
    private final String email;

    @JsonProperty("cpf")
    @Schema(description = "CPF", example = "12345678900")
    private final String cpf;

    @JsonProperty("enrollmentCode")
    @Schema(description = "Número de matrícula", example = "202100001")
    private final String matricula;

    @JsonProperty("birthDate")
    @Schema(description = "Data de nascimento", example = "2000-05-20")
    private final LocalDate dataNascimento;

    @JsonProperty("role")
    @Schema(description = "Role no sistema", example = "ALUNO")
    private final Role role;

    @JsonProperty("course")
    @Schema(description = "Departamento vinculado")
    private final DepartamentoResponse departamento;

    public AlunoResponse(Aluno aluno) {
        this.id = aluno.getId();
        this.nome = aluno.getNome();
        this.email = aluno.getEmail();
        this.cpf = aluno.getCpf();
        this.matricula = aluno.getMatricula();
        this.dataNascimento = aluno.getDataNascimento();
        this.role = aluno.getRole();
        this.departamento = aluno.getDepartamento() != null
                ? new DepartamentoResponse(aluno.getDepartamento())
                : null;
    }
}
