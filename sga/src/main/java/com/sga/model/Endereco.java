package com.sga.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SoftDelete;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
public class Endereco {

    private String numero;
    private String cep;
    private String obs;

    public String getEnderecoCompleto(){
        return "N° "+ this.numero + ", " + this.cep + " - " + this.obs;
    }
}