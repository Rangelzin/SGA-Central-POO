package com.sga.controller;

import com.sga.controller.dto.AvaliacaoResponse;
import com.sga.controller.dto.FrequenciaRequest;
import com.sga.controller.dto.MatriculaResponse;
import com.sga.controller.dto.NotaRequest;
import com.sga.repository.AvaliaRepository;
import com.sga.service.AvaliacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/avaliacoes")
@RequiredArgsConstructor
@Tag(name = "Avaliações", description = "Registro de notas e frequência (UC-05)")
@SecurityRequirement(name = "bearerAuth")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;
    private final AvaliaRepository avaliaRepository;

    @PostMapping("/nota")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Registra nota de avaliação", description = "Cria uma avaliação com nota para um matriculado. Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Nota registrada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Matrícula não encontrada")
    })
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
    @Operation(summary = "Registra frequência do aluno", description = "Atualiza a frequência (0-100) de um matriculado. Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Frequência registrada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Matrícula não encontrada")
    })
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
    @Operation(summary = "Busca avaliação por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Avaliação encontrada"),
            @ApiResponse(responseCode = "404", description = "Avaliação não encontrada")
    })
    public AvaliacaoResponse detalhar(@PathVariable UUID id) {
        return avaliaRepository.findById(id)
                .map(AvaliacaoResponse::new)
                .orElseThrow(() -> new com.sga.exception.ResourceNotFoundException("Avaliação", id));
    }
}
