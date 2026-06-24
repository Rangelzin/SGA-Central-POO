package com.sga.repository;

import com.sga.model.Pessoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.Optional;
import java.util.UUID;

@NoRepositoryBean
public interface PessoaRepository<T extends Pessoa> extends JpaRepository<T, UUID> {

    Optional<T> findByEmail(String email);
    Optional<T> findByCpf(String cpf);
    
    boolean existsByEmail(String email);
    boolean existsByCpf(String cpf);
}