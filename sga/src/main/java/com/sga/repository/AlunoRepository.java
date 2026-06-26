package com.sga.repository;

import com.sga.model.Aluno;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlunoRepository extends JpaRepository<Aluno, UUID> {

    Optional<Aluno> findByEmail(String email);

    Optional<Aluno> findByCpf(String cpf);

    Page<Aluno> findByNomeContainingIgnoreCase(String nome, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByCpf(String cpf);
}
