package com.sga.repository;

import com.sga.model.Departamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepartamentoRepository extends JpaRepository<Departamento, UUID> {

    Optional<Departamento> findBySigla(String sigla);

    @Query("SELECT d FROM Departamento d WHERE d.universidade.id = :universidadeId")
    List<Departamento> findDepartamentoByUnivesidade(@Param("universidadeId")UUID universidadeId);

}