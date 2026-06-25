package com.sga.repository;

import com.sga.model.Matriculado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MatriculadoRepository extends JpaRepository<Matriculado, UUID> {

    // histórico acadêmico. Busca todas as matrículas de um aluno em específico
    @Query("SELECT m FROM Matriculado m WHERE m.aluno.id = :alunoId")
    List<Matriculado> findMatriculadosByAluno(@Param("alunoId")UUID alunoId);

    // todas as matriculas de uma turma
    @Query("SELECT m FROM Matriculado m WHERE m.turma.id = :turmaId")
    List<Matriculado> findMatriculadosByTurma(@Param("turmaId")UUID turmaId);

    boolean existsByAlunoAndTurma(UUID alunoId, UUID turmaId);
}