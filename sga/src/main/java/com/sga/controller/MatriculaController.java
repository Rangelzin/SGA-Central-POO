package com.sga.controller;

import com.sga.controller.dto.MatriculaRequest;
import com.sga.controller.dto.MatriculaResponse;
import com.sga.service.MatriculaService;
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
public class MatriculaController {

    private final MatriculaService matriculaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public MatriculaResponse matricular(@RequestBody @Valid MatriculaRequest request) {
        return new MatriculaResponse(
                matriculaService.matricular(request.getAlunoId(), request.getTurmaId())
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public void cancelar(@PathVariable UUID id) {
        matriculaService.cancelar(id);
    }

    @GetMapping("/meus")
    @PreAuthorize("hasRole('ALUNO')")
    public List<MatriculaResponse> minhasMatriculas(@AuthenticationPrincipal Jwt jwt) {
        UUID pessoaId = UUID.fromString(jwt.getClaim("pessoaId"));
        return matriculaService.listarPorAluno(pessoaId)
                .stream()
                .map(MatriculaResponse::new)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESSOR') or @customSecurity.isOwner(#id)")
    public MatriculaResponse detalhar(@PathVariable UUID id) {
        return new MatriculaResponse(matriculaService.buscarPorId(id));
    }
}
