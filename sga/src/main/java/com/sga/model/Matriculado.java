package com.sga.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "matriculado")
public class Matriculado {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    private Double nota;
    private String status;
    private Integer frequencia;

    @ManyToOne
    private Aluno aluno;
    @ManyToOne
    private Turma turma;
    @OneToMany(mappedBy = "matriculado")
    private List<Avalia> avaliacoes = new ArrayList<>();

    public Double calcularMedia(){
        return null;
    }
    public String calcularSituacao(){
        return null;
    }
    public void adicionarAvaliacao(Avalia avaliacao){}
    public boolean isAprovado(){
        return false;
    }


}
