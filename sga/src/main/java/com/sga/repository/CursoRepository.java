package com.sga.repository;

import com.sga.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CursoRepository extends JpaRepository<Curso, UUID> {

    Optional<Curso> findBySigla(String sigla);

    @Query("SELECT c FROM Curso c WHERE c.departamento.id = :departamentoId")
    List<Curso> findCursoByDepartamento(@Param("departamentoId")UUID departamentoId);

}