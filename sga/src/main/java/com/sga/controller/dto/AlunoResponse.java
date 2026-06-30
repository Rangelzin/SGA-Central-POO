package com.sga.controller.dto;

import com.sga.model.Aluno;
import com.sga.model.enums.Role;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
public class AlunoResponse {

    private final UUID id;
    private final String nome;
    private final String email;
    private final String cpf;
    private final String matricula;
    private final LocalDate dataNascimento;
    private final Role role;
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
