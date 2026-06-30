package com.sga.controller.dto;

import com.sga.model.Professor;
import com.sga.model.enums.Role;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
public class ProfessorResponse {

    private final UUID id;
    private final String nome;
    private final String email;
    private final String cpf;
    private final String matricula;
    private final LocalDate dataNascimento;
    private final String titulacao;
    private final Role role;
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
