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
@Table(name = "departamento")
public class Departamento {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @NotBlank
    private String sigla;
    @NotBlank
    private String nome;
    @Embedded
    private Endereco endereco;

    @ManyToOne
    private Universidade universidade;
    @OneToMany(mappedBy = "departamento")
    private List<Professor> professores = new ArrayList<>();
    @OneToMany(mappedBy = "departamento")
    private List<Curso> cursos = new ArrayList<>();
    @OneToMany(mappedBy = "departamento")
    private List<Disciplina> disciplinas = new ArrayList<>();

    public List<Professor> listarProfessores(){
        return this.professores;
    }
    public List<Curso> listarCursos(){
        return this.cursos;
    }


}
