package com.sga.repository;

import com.sga.model.Matriculado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MatriculadoRepository extends JpaRepository<Matriculado, UUID> {

    @Query(nativeQuery = true, value = "SELECT m.* FROM matriculado m WHERE m.aluno_id = :alunoId AND m.deleted = false")
    List<Matriculado> findByAlunoId(@Param("alunoId")UUID alunoId);

    @Query(nativeQuery = true, value = "SELECT m.* FROM matriculado m WHERE m.turma_id = :turmaId AND m.deleted = false")
    List<Matriculado> findByTurmaId(@Param("turmaId")UUID turmaId);

    @Query(nativeQuery = true, value = "SELECT CASE WHEN COUNT(m.id) > 0 THEN true ELSE false END FROM matriculado m WHERE m.aluno_id = :alunoId AND m.turma_id = :turmaId AND m.deleted = false")
    boolean existsByAlunoIdAndTurmaId(@Param("alunoId")UUID alunoId, @Param("turmaId")UUID turmaId);
}