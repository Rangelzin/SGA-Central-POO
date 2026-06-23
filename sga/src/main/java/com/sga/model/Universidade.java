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
@Table(name = "universidade")
public class Universidade {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    @NotBlank
    private String nome;
    @NotBlank
    private String sigla;
    @Embedded
    private Endereco endereco;

    @OneToMany(mappedBy = "universidade")
    private List<Departamento> departamentos = new ArrayList<>();

    public List<Departamento> listarDepartamentos(){
        return this.departamentos;
    }

}
