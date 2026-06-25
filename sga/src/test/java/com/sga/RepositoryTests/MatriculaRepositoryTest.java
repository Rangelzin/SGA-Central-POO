package com.sga.RepositoryTests;

import com.sga.model.*;
import com.sga.model.enums.Role;
import com.sga.model.enums.StatusMatricula;
import com.sga.repository.MatriculadoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class MatriculadoRepositoryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private MatriculadoRepository repository;

    @Test
    void deveBuscarMatriculasPorAluno() {
        Aluno aluno = new Aluno();
        aluno.setNome("Bia");
        aluno.setEmail("bia@uni.br");
        aluno.setSenha("s");
        aluno.setRole(Role.ALUNO);
        aluno.setCpf("123.456.789-00");
        em.persist(aluno);

        Departamento dep = new Departamento();
        dep.setNome("Exatas");
        dep.setSigla("DEX");
        em.persist(dep);

        Disciplina disc = new Disciplina();
        disc.setCodigo("MAT001");
        disc.setCargaHoraria(60);
        disc.setDepartamento(dep);
        em.persist(disc);

        Professor prof = new Professor();
        prof.setNome("Prof X");
        prof.setEmail("x@uni.br");
        prof.setSenha("s");
        prof.setRole(Role.PROFESSOR);
        prof.setTitulacao("Mestre");
        prof.setCpf("222.333.444-55");
        em.persist(prof);

        Turma turma = new Turma();
        turma.setCodigo("T099");
        turma.setDisciplina(disc);
        turma.setProfessor(prof);
        em.persist(turma);

        Matriculado m = new Matriculado();
        m.setAluno(aluno);
        m.setTurma(turma);
        m.setStatus(StatusMatricula.ATIVA);
        em.persistAndFlush(m);

        List<Matriculado> porAluno = repository.findByAlunoId(aluno.getId());
        assertThat(porAluno).hasSize(1);

        List<Matriculado> porTurma = repository.findByTurmaId(turma.getId());
        assertThat(porTurma).hasSize(1);
        assertThat(porTurma.get(0).getStatus()).isEqualTo(StatusMatricula.ATIVA);
    }

    @Test
    void deveVerificarDuplicataDeMatricula() {
        Aluno aluno = new Aluno();
        aluno.setNome("Leo");
        aluno.setEmail("leo@uni.br");
        aluno.setSenha("s");
        aluno.setRole(Role.ALUNO);
        aluno.setCpf("111.222.333-44");
        em.persist(aluno);

        Departamento dep = new Departamento();
        dep.setNome("TI");
        dep.setSigla("DTI");
        em.persist(dep);

        Disciplina disc = new Disciplina();
        disc.setCodigo("SD001");
        disc.setCargaHoraria(60);
        disc.setDepartamento(dep);
        em.persist(disc);

        Professor prof = new Professor();
        prof.setNome("Prof Y");
        prof.setEmail("y@uni.br");
        prof.setSenha("s");
        prof.setRole(Role.PROFESSOR);
        prof.setTitulacao("Dr");
        prof.setCpf("555.666.777-88");
        em.persist(prof);

        Turma turma = new Turma();
        turma.setCodigo("T200");
        turma.setDisciplina(disc);
        turma.setProfessor(prof);
        em.persist(turma);

        Matriculado m = new Matriculado();
        m.setAluno(aluno);
        m.setTurma(turma);
        em.persistAndFlush(m);

        assertThat(repository.existsByAlunoIdAndTurmaId(aluno.getId(), turma.getId())).isTrue();
    }
}