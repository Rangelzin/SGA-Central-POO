package com.sga.repository;

import com.sga.model.Avalia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface AvaliaRepository extends JpaRepository<Avalia, UUID> {

    @Query("SELECT a FROM Avalia a WHERE a.matriculado.uuid = :matriculadoId")
    List<Avalia> findAvaliacoesByMatriculado(@Param("matriculadoId")UUID matriculadoId);

    List<Avalia> findByTipo(String tipo);
}