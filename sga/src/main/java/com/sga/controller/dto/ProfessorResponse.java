package com.sga.controller.dto;

import com.sga.model.Professor;
import com.sga.model.enums.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Schema(description = "Dados de resposta de um professor")
public class ProfessorResponse {

    @Schema(description = "ID único do professor", example = "550e8400-e29b-41d4-a716-446655440001")
    private final UUID id;

    @Schema(description = "Nome completo", example = "Dra. Maria Souza")
    private final String nome;

    @Schema(description = "E-mail institucional", example = "maria.souza@ufg.br")
    private final String email;

    @Schema(description = "CPF", example = "98765432100")
    private final String cpf;

    @Schema(description = "Número de matrícula", example = "P202100001")
    private final String matricula;

    @Schema(description = "Data de nascimento", example = "1975-03-15")
    private final LocalDate dataNascimento;

    @Schema(description = "Titulação acadêmica", example = "Doutorado")
    private final String titulacao;

    @Schema(description = "Role no sistema", example = "PROFESSOR")
    private final Role role;

    @Schema(description = "Departamento vinculado")
    private final DepartamentoResponse departamento;

    public ProfessorResponse(Professor professor) {
        this.id = professor.getId();
        this.nome = professor.getNome();
        this.email = professor.getEmail();
        this.cpf = professor.getCpf();
        this.matricula = professor.getMatricula();
        this.dataNascimento = professor.getDataNascimento();
        this.titulacao = professor.getTitulacao();
        this.role = professor.getRole();
        this.departamento = professor.getDepartamento() != null
                ? new DepartamentoResponse(professor.getDepartamento())
                : null;
    }
}
