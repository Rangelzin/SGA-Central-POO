package com.sga.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@SoftDelete
@Table(name = "curso")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String sigla;
    @NotBlank
    private String nome;
    @Embedded
    private CargaHoraria cargaHoraria;

    @ManyToOne(fetch = FetchType.LAZY)
    private Departamento departamento;
    @ManyToMany
    @JoinTable(
            name = "curso_disciplina",
            joinColumns = @JoinColumn(name = "curso_id"),
            inverseJoinColumns = @JoinColumn(name = "disciplina_id")

    )
    private List<Disciplina> disciplinas = new ArrayList<>();

    public List<Disciplina> listarDisciplinas(){
        return this.disciplinas;
    }
    public Integer calcularCargaHorariaTotal(){
        return null;
    }

}
