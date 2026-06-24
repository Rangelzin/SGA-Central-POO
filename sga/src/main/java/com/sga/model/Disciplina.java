package com.sga.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@SoftDelete
@NoArgsConstructor
@Table(name = "disciplina")
public class Disciplina {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String codigo;
    private String tipo;
    @NotNull
    private Integer cargaHoraria;
    private String preRequisito;

    @ManyToOne
    private Departamento departamento;
    @ManyToMany(mappedBy = "disciplinas")
    private List<Curso> cursos = new ArrayList<>();
    @OneToMany(mappedBy = "disciplina")
    private List<Turma> turmas = new ArrayList<>();

    public List<Turma> listarTurma(){
        return this.turmas;
    }
    public void ativar(){}

}
