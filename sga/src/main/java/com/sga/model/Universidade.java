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
@Table(name = "universidade")
public class Universidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nome;
    @NotBlank
    private String sigla;
    @Embedded
    private Endereco endereco;

    @OneToMany(mappedBy = "universidade", fetch = FetchType.LAZY)
    private List<Departamento> departamentos = new ArrayList<>();

    public List<Departamento> listarDepartamentos(){
        return this.departamentos;
    }

}
