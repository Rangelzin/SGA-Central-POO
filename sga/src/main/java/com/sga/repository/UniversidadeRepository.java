package com.sga.repository;

import com.sga.model.Universidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UniversidadeRepository extends JpaRepository<Universidade, UUID> {

    Optional<Universidade> findBySigla(String sigla);

    boolean existsBySigla(String sigla);

}