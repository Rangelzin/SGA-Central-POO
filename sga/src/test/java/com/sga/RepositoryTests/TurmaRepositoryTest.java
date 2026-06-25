package com.sga.RepositoryTests;

import com.sga.model.Departamento;
import com.sga.model.Disciplina;
import com.sga.model.Professor;
import com.sga.model.Turma;
import com.sga.model.enums.Role;
import com.sga.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TurmaRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private TurmaRepository repository;

    @Test
    void deveBuscarTurmasPorDisciplina() {
        Departamento dep = new Departamento();
        dep.setNome("Computação");
        dep.setSigla("INF");
        em.persist(dep);

        Disciplina disc = new Disciplina();
        disc.setCodigo("POO001");
        disc.setCargaHoraria(60);
        disc.setDepartamento(dep);
        em.persist(disc);

        Professor prof = new Professor();
        prof.setNome("Dr. Turing");
        prof.setEmail("turing@uni.br");
        prof.setSenha("s");
        prof.setRole(Role.PROFESSOR); 
        prof.setTitulacao("PhD");
        prof.setCpf("999.888.777-66");
        em.persist(prof);

        Turma t1 = new Turma();
        t1.setCodigo("T001");
        t1.setDisciplina(disc);
        t1.setProfessor(prof);
        em.persist(t1);

        Turma t2 = new Turma();
        t2.setCodigo("T002");
        t2.setDisciplina(disc);
        t2.setProfessor(prof);
        em.persist(t2);

        em.flush();

        
        List<Turma> turmas = repository.findTurmaByDisciplina(disc.getId());

        assertThat(turmas).hasSize(2);
        assertThat(turmas).extracting(Turma::getCodigo)
                .containsExactlyInAnyOrder("T001", "T002");
    }
}