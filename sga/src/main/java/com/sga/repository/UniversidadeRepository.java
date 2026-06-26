package com.sga.repository;

import com.sga.model.Universidade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UniversidadeRepository extends JpaRepository<Universidade, Long> {

    Optional<Universidade> findBySigla(String sigla);

    boolean existsBySigla(String sigla);

}