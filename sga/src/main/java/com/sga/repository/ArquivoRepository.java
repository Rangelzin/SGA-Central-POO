package com.sga.repository;

import com.sga.model.Arquivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ArquivoRepository extends JpaRepository<Arquivo, UUID>{  
    
    Optional<Arquivo> findByNome(String nome);

    @Query("SELECT arq FROM Arquivo arq JOIN arq.avaliacoes a WHERE a.id = :avaliaId")
    List<Arquivo> findArquivosByAvaliacao(@Param("avaliaId") UUID avaliaId);
    
}
