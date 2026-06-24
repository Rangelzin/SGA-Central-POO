package com.sga.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SoftDelete;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@SoftDelete
@NoArgsConstructor
@Table(name = "arquivo")
public class Arquivo {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    private String nome;
    private String caminho;

    @ManyToMany(mappedBy = "arquivos")
    private List<Avalia> avaliacoes = new ArrayList<>();
}
