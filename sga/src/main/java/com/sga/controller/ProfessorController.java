package com.sga.controller;

import com.sga.controller.dto.ErrorResponse;
import com.sga.controller.dto.ProfessorRequest;
import com.sga.controller.dto.ProfessorResponse;
import com.sga.controller.dto.TurmaResponse;
import com.sga.model.Departamento;
import com.sga.model.Professor;
import com.sga.repository.TurmaRepository;
import com.sga.service.ProfessorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("api/professores")
@RequiredArgsConstructor
@Tag(name = "Professores", description = "Gerenciamento de professores (UC-02)")
@SecurityRequirement(name = "bearerAuth")
public class ProfessorController {

    private final ProfessorService professorService;
    private final TurmaRepository turmaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista professores paginado", description = "Filtra por nome (opcional). Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de professores retornada"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Sem permissão",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Page<ProfessorResponse> listar(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return professorService.listar(nome, pageable).map(ProfessorResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cria novo professor", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Professor criado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ProfessorResponse criar(@RequestBody @Valid ProfessorRequest request) {
        return new ProfessorResponse(professorService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Busca professor por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Professor encontrado"),
            @ApiResponse(responseCode = "404", description = "Professor não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ProfessorResponse detalhar(@PathVariable UUID id) {
        return new ProfessorResponse(professorService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza professor", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Professor atualizado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Professor não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ProfessorResponse atualizar(@PathVariable UUID id,
                                       @RequestBody @Valid ProfessorRequest request) {
        return new ProfessorResponse(professorService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove professor", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Professor removido",
                    content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Professor não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void deletar(@PathVariable UUID id) {
        professorService.deletar(id);
    }

    @GetMapping("/{id}/turmas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista turmas do professor")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Turmas listadas"),
            @ApiResponse(responseCode = "404", description = "Professor não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<TurmaResponse> turmas(@PathVariable UUID id) {
        professorService.buscarPorId(id);
        return turmaRepository.findTurmaByProfessor(id).stream()
                .map(TurmaResponse::new)
                .toList();
    }

    // ----- helper -----

    private Professor toModel(ProfessorRequest req) {
        Professor professor = new Professor();
        professor.setNome(req.getNome());
        professor.setEmail(req.getEmail());
        professor.setCpf(req.getCpf());
        professor.setMatricula(req.getMatricula());
        professor.setDataNascimento(req.getDataNascimento());
        professor.setTitulacao(req.getTitulacao());
        professor.setSenha(req.getSenha());
        if (req.getDepartamento() != null) {
            Departamento dep = new Departamento();
            dep.setId(req.getDepartamento().getId());
            professor.setDepartamento(dep);
        }
        return professor;
    }
}
