package com.sga.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@SoftDelete
@Table(name = "turma")
public class Turma {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    private String codigo;
    private String horario;
    private String localidade;
    private LocalDate dataIn;
    private LocalDate dataOut;

    @ManyToOne(fetch = FetchType.LAZY)
    private Disciplina disciplina;
    @ManyToOne(fetch = FetchType.LAZY)
    private Professor professor;
    @OneToMany(mappedBy = "turma", fetch = FetchType.LAZY)
    private List<Matriculado> matriculados = new ArrayList<>();

    public Matriculado adicionarAluno(Aluno aluno){
        return null;
    }
    public void removerAluno(Aluno aluno) {}
    public boolean isVagaDisponivel(){
        return false;
    }
    public List<Aluno> listarAlunos(){
        return null;
    }
    public String gerarRelatorio(){
        return null;
    }
    public Integer getVagasDisponiveis(){
        return null;
    }

}
