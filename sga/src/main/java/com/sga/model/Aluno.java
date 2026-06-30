package com.sga.model;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@PrimaryKeyJoinColumn(name = "id")
@Setter
@Getter
@NoArgsConstructor
public class Aluno extends Pessoa {

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
        // Regra de negócio
    }

    public List<Matriculado> consultarHistorico(){
        return this.matriculas;
    }
}
