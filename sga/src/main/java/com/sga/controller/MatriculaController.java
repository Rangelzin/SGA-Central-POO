package com.sga.controller;

import com.sga.controller.dto.ErrorResponse;
import com.sga.controller.dto.MatriculaRequest;
import com.sga.controller.dto.MatriculaResponse;
import com.sga.service.MatriculaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/matriculas")
@RequiredArgsConstructor
@Tag(name = "Matrículas", description = "Matrícula e cancelamento de alunos em turmas (UC-04)")
@SecurityRequirement(name = "bearerAuth")
public class MatriculaController {

    private final MatriculaService matriculaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Matricula aluno em turma", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Matrícula realizada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou turma sem vagas",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Aluno já matriculado nesta turma",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public MatriculaResponse matricular(@RequestBody @Valid MatriculaRequest request) {
        return new MatriculaResponse(
                matriculaService.matricular(request.getAlunoId(), request.getTurmaId())
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Cancela matrícula", description = "Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Matrícula cancelada",
                    content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Matrícula não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void cancelar(@PathVariable UUID id) {
        matriculaService.cancelar(id);
    }

    @GetMapping("/meus")
    @PreAuthorize("hasRole('ALUNO')")
    @Operation(summary = "Lista minhas matrículas", description = "Retorna as matrículas do aluno autenticado. Requer ALUNO.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Matrículas retornadas"),
            @ApiResponse(responseCode = "403", description = "Sem permissão",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<MatriculaResponse> minhasMatriculas(@AuthenticationPrincipal Jwt jwt) {
        UUID pessoaId = UUID.fromString(jwt.getClaim("pessoaId"));
        return matriculaService.listarPorAluno(pessoaId)
                .stream()
                .map(MatriculaResponse::new)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or @customSecurity.isOwner(#id)")
    @Operation(summary = "Busca matrícula por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Matrícula encontrada"),
            @ApiResponse(responseCode = "403", description = "Sem permissão",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Matrícula não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public MatriculaResponse detalhar(@PathVariable UUID id) {
        return new MatriculaResponse(matriculaService.buscarPorId(id));
    }
}
