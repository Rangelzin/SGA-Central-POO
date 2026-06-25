package com.sga.repository;

import com.sga.model.Universidade;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UniversidadeRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private UniversidadeRepository repository;

    @Test
    void deveBuscarPorSigla() {
        Universidade u = new Universidade();
        u.setNome("Universidade Federal de Goiás");
        u.setSigla("UFG");
        em.persistAndFlush(u);

        Optional<Universidade> resultado = repository.findBySigla("UFG");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getNome()).isEqualTo("Universidade Federal de Goiás");
    }

    @Test
    void deveVerificarExistenciaPorSigla() {
        Universidade u = new Universidade();
        u.setNome("Universidade Estadual de Goiás");
        u.setSigla("UEG");
        em.persistAndFlush(u);

        assertThat(repository.existsBySigla("UEG")).isTrue();
        assertThat(repository.existsBySigla("UFF")).isFalse();
    }
}