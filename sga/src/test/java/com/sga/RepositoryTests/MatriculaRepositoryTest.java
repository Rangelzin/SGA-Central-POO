package com.sga.repository;

import com.sga.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

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
        aluno.setRole("ALUNO");
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
        prof.setRole("PROFESSOR");
        prof.setTitulacao("Mestre");
        em.persist(prof);

        Turma turma = new Turma();
        turma.setCodigo("T099");
        turma.setDisciplina(disc);
        turma.setProfessor(prof);
        em.persist(turma);

        Matriculado m = new Matriculado();
        m.setAluno(aluno);
        m.setTurma(turma);
        m.setStatus("ATIVO");
        em.persistAndFlush(m);

        List<Matriculado> porAluno = repository.findMatriculadosByAluno(aluno.getUuid());
        assertThat(porAluno).hasSize(1);

        List<Matriculado> porTurma = repository.findMatriculadosByTurma(turma.getUuid());
        assertThat(porTurma).hasSize(1);
        assertThat(porTurma.get(0).getStatus()).isEqualTo("ATIVO");
    }

    @Test
    void deveVerificarDuplicataDeMatricula() {
        Aluno aluno = new Aluno();
        aluno.setNome("Leo");
        aluno.setEmail("leo@uni.br");
        aluno.setSenha("s");
        aluno.setRole("ALUNO");
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
        prof.setRole("PROFESSOR");
        prof.setTitulacao("Dr");
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

        assertThat(repository.existsByAlunoUuidAndTurmaUuid(aluno.getUuid(), turma.getUuid())).isTrue();
    }
}