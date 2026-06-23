package com.sga.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "admin")
public class Admin extends Pessoa {

    public void gerenciarUsuarios(){

    }
    public String gerarRelatorioGeral(){
        return null;
    }


}
