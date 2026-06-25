package com.sga.repository;

import com.sga.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, UUID> {

    Optional<Pessoa> findByEmail(String email);
    Optional<Pessoa> findByCpf(String cpf);

    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
}