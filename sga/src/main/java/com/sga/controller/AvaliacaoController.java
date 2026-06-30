package com.sga.controller;

import com.sga.controller.dto.AvaliacaoResponse;
import com.sga.controller.dto.FrequenciaRequest;
import com.sga.controller.dto.MatriculaResponse;
import com.sga.controller.dto.NotaRequest;
import com.sga.repository.AvaliaRepository;
import com.sga.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/avaliacoes")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final AvaliaRepository avaliaRepository;

    @PostMapping("/nota")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public AvaliacaoResponse registrarNota(@RequestBody @Valid NotaRequest request) {
        return new AvaliacaoResponse(
                avaliacaoService.registrarNota(
                        request.getMatriculadoId(),
                        request.getNota(),
                        request.getPeso(),
                        request.getTipo(),
                        request.getDescricao()
                )
        );
    }

    @PostMapping("/frequencia")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public MatriculaResponse registrarFrequencia(@RequestBody @Valid FrequenciaRequest request) {
        return new MatriculaResponse(
                avaliacaoService.registrarFrequencia(
                        request.getMatriculadoId(),
                        request.getFrequencia()
                )
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR', 'ALUNO')")
    public AvaliacaoResponse detalhar(@PathVariable UUID id) {
        return avaliaRepository.findById(id)
                .map(AvaliacaoResponse::new)
                .orElseThrow(() -> new com.sga.exception.ResourceNotFoundException("Avaliação", id));
    }
}
