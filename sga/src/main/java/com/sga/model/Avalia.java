package com.sga.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "avalia")
public class Avalia {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID uuid;

    private String status;
    private String descricao;
    private Double nota;
    private String tipo;
    private LocalDate dataIn;
    private LocalDate dataOut;
    @ElementCollection
    private List<String> arquivos = new ArrayList<>();

    @ManyToOne
    private Matriculado matriculado;

    public void registrar(Double nota, String tipo){}
    public Double calcularPeso(){
        return null;
    }
}
