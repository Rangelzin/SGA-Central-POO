package com.sga.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
@NoArgsConstructor
public class Admin extends Pessoa {

    public void gerenciarUsuarios(){
        // Regra de negócio
    }

    public String gerarRelatorioGeral(){
        return null;
    }
}
