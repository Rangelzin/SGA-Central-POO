package com.sga.repository;

import com.sga.model.Aluno;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
@DataJpaTest
class AlunoRepositoryTest {

    @Autowired
    private TestEntityManager em; 

    @Autowired
    private AlunoRepository repository;

    private Aluno criarAluno(String nome, String email, String cpf) {
        Aluno a = new Aluno();
        a.setNome(nome);
        a.setEmail(email);
        a.setSenha("senha123");
        a.setRole("ALUNO");
        a.setCpf(cpf);
        return em.persistFlushFind(a);
    }

    @Test
    void deveSalvarEBuscarPorEmail() {
        criarAluno("Rangel Silva", "rangel@uni.br", "111.111.111-11");

        Optional<Aluno> resultado = repository.findByEmail("rangel@uni.br");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getNome()).isEqualTo("Rangel Silva");
    }

    @Test
    void deveBuscarPorCpf() {
        criarAluno("Tiago Souza", "tiago@uni.br", "222.222.222-22");

        Optional<Aluno> resultado = repository.findByCpf("222.222.222-22");

        assertThat(resultado).isPresent();
        assertThat(resultado.get().getEmail()).isEqualTo("tiago@uni.br");
    }

    @Test
    void deveRetornarVazioParaEmailInexistente() {
        Optional<Aluno> resultado = repository.findByEmail("naoexiste@uni.br");

        assertThat(resultado).isEmpty();
    }

    @Test
    void deveVerificarExistenciaPorEmail() {
        criarAluno("Brunao", "bruno@uni.br", "333.333.333-33");

        assertThat(repository.existsByEmail("bruno@uni.br")).isTrue();
        assertThat(repository.existsByEmail("outro@uni.br")).isFalse();
    }
}