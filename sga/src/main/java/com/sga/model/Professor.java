package com.sga.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "professor")
public class Professor extends Pessoa {
    @NotBlank
    private String titulacao;

    @ManyToOne(fetch = FetchType.LAZY)
    private Departamento departamento;
    @OneToMany(mappedBy = "professor", fetch = FetchType.LAZY)
    private List<Turma> turmas = new ArrayList<>();

    public void registrarNota(Matriculado m, Double nota){}
    public void registrarFrequencia(Matriculado m, Integer frequencia){}
    public List<Turma> listarTurmas(){
        return this.turmas;
    }
    public String gerarRelatorioTurma(Turma turma){
        return null;
    }


}
