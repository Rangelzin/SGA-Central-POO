package com.sga.model;

import com.sga.model.enums.TipoAvaliacao;
import jakarta.persistence.*;
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
@Table(name = "avalia")
public class Avalia {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String status;
    private String descricao;
    private Double nota;
    @Enumerated(EnumType.STRING)
    private TipoAvaliacao tipo;
    private LocalDate dataIn;
    private LocalDate dataOut;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "avalia_anexo",
            joinColumns = @JoinColumn(name = "avalia_id"),
            inverseJoinColumns = @JoinColumn(name = "arquivo_id")
    )
    private List<Arquivo> arquivos = new ArrayList<>();
    @ManyToOne(fetch = FetchType.LAZY)
    private Matriculado matriculado;

    public void registrar(Double nota, String tipo){}
    public Double calcularPeso(){
        return null;
    }
}
