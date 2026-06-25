package com.sga.RepositoryTests;

import com.sga.model.Professor;
import com.sga.model.enums.Role;
import com.sga.repository.ProfessorRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ProfessorRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private ProfessorRepository repository;

    private Professor criarProfessor(String nome, String email) {
        Professor p = new Professor();
        p.setNome(nome);
        p.setEmail(email);
        p.setSenha("senha123");
        p.setRole(Role.PROFESSOR); 
        p.setTitulacao("Doutor");
        return em.persistFlushFind(p);
    }

    @Test
    void deveBuscarProfessorPorEmail() {
        criarProfessor("Ana Lima", "ana@uni.br");

        Optional<Professor> resultado = repository.findByEmail("ana@uni.br");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getTitulacao()).isEqualTo("Doutor");
    }

    @Test
    void deveVerificarExistenciaPorEmail() {
        criarProfessor("Pedro Alves", "pedro@uni.br");

        assertThat(repository.existsByEmail("pedro@uni.br")).isTrue();
        assertThat(repository.existsByEmail("fantasma@uni.br")).isFalse();
    }
}