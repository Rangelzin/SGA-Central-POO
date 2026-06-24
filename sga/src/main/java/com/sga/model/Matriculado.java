package com.sga.model;

import com.sga.model.enums.StatusMatricula;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@SoftDelete
@Table(name = "matriculado")
public class Matriculado {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private BigDecimal nota;
    @Enumerated(EnumType.STRING)
    private StatusMatricula status;
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
