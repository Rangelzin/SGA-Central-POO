package com.sga.repository;

import com.sga.model.Turma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TurmaRepository extends JpaRepository<Turma, UUID> {

    Optional<Turma> findByCodigo(String codigo);

    @Query("Select t FROM Turma t WHERE t.disciplina.uuid = :disciplinaId")
    List<Turma> findTurmaByDisciplina(@Param("disciplinaId")UUID disciplinaId);

    @Query("Select t FROM Turma t WHERE t.professor.uuid = :professorId")
    List<Turma> findTurmaByProfessor(@Param("professorId")UUID professorId);
}