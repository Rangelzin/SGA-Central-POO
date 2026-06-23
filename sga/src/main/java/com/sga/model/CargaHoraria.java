package com.sga.model;

import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@Embeddable
@NoArgsConstructor
public class CargaHoraria {

    private Integer chObrigatoria;
    private Integer chOptativa;
    private Integer chNucleoLivre;

    public Integer calcularTotal() {
        int obrigatoria = (this.chObrigatoria == null) ? 0 : this.chObrigatoria;
        int optativa = (this.chOptativa == null) ? 0 : this.chOptativa;
        int nucleoLivre = (this.chNucleoLivre == null) ? 0 : this.chNucleoLivre;
        return obrigatoria + optativa + nucleoLivre;
    }
}
