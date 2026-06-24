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
@Table(name = "departamento")
public class Departamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String sigla;
    @NotBlank
    private String nome;
    @Embedded
    private Endereco endereco;

    @ManyToOne(fetch = FetchType.LAZY)
    private Universidade universidade;
    @OneToMany(mappedBy = "departamento", fetch = FetchType.LAZY)
    private List<Professor> professores = new ArrayList<>();
    @OneToMany(mappedBy = "departamento", fetch = FetchType.LAZY)
    private List<Curso> cursos = new ArrayList<>();
    @OneToMany(mappedBy = "departamento", fetch = FetchType.LAZY)
    private List<Disciplina> disciplinas = new ArrayList<>();

    public List<Professor> listarProfessores(){
        return this.professores;
    }
    public List<Curso> listarCursos(){
        return this.cursos;
    }


}
