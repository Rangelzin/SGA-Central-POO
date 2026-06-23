package com.sga.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "curso")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @NotBlank
    private String sigla;
    @NotBlank
    private String nome;
    @Embedded
    private CargaHoraria cargaHoraria;

    @ManyToOne
    private Departamento departamento;
    @ManyToMany
    @JoinTable(
            name = "curso_disciplina",
            joinColumns = @JoinColumn(name = "curso_uuid"),
            inverseJoinColumns = @JoinColumn(name = "disciplina_uuid")

    )
    private List<Disciplina> disciplinas = new ArrayList<>();

    public List<Disciplina> listarDisciplinas(){
        return this.disciplinas;
    }
    public Integer calcularCargaHorariaTotal(){
        return null;
    }

}
