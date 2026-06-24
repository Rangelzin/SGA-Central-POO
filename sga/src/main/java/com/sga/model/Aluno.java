package com.sga.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@Table(name = "aluno")
public class Aluno extends Pessoa{
    private BigDecimal nota;
    private BigDecimal frequencia;

    @OneToMany(mappedBy = "aluno")
    private List<Matriculado> matriculas = new ArrayList<>();
    @ManyToOne
    private Departamento departamento;

    public Matriculado realizarMatricula(Turma turma){
        return null;
    }

    public void cancelarMatricula(Turma turma){

    }

    public List<Matriculado> consultarHistorico(){
        return this.matriculas;
    }


}