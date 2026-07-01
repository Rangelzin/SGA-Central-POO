package com.sga.controller;

import com.sga.controller.dto.AlunoResponse;
import com.sga.controller.dto.ErrorResponse;
import com.sga.controller.dto.TurmaRequest;
import com.sga.controller.dto.TurmaResponse;
import com.sga.model.Disciplina;
import com.sga.model.Professor;
import com.sga.model.Turma;
import com.sga.model.enums.StatusMatricula;
import com.sga.service.MatriculaService;
import com.sga.service.TurmaService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/turmas")
@RequiredArgsConstructor
@Tag(name = "Turmas", description = "Gerenciamento de turmas, alunos matriculados e vagas disponíveis")
@SecurityRequirement(name = "bearerAuth")
public class TurmaController {

    private final TurmaService turmaService;
    private final MatriculaService matriculaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista turmas paginado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de turmas retornada"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Page<TurmaResponse> listar(
            @PageableDefault(size = 20, sort = "codigo") Pageable pageable) {
        return turmaService.listar(pageable).map(TurmaResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cria nova turma", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Turma criada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public TurmaResponse criar(@RequestBody @Valid TurmaRequest request) {
        return new TurmaResponse(turmaService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Busca turma por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Turma encontrada"),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public TurmaResponse detalhar(@PathVariable UUID id) {
        return new TurmaResponse(turmaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza turma", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Turma atualizada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public TurmaResponse atualizar(@PathVariable UUID id,
                                   @RequestBody @Valid TurmaRequest request) {
        return new TurmaResponse(turmaService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove turma", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Turma removida",
                    content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void deletar(@PathVariable UUID id) {
        turmaService.deletar(id);
    }

    @GetMapping("/{id}/alunos")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista alunos matriculados na turma")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Alunos listados"),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<AlunoResponse> alunos(@PathVariable UUID id) {
        return turmaService.listarAlunos(id)
                .stream()
                .map(AlunoResponse::new)
                .toList();
    }

    @GetMapping("/{id}/vagas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Consulta vagas disponíveis na turma")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Informações de vagas retornadas"),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Map<String, Object> vagas(@PathVariable UUID id) {
        Turma turma = turmaService.buscarPorId(id);
        long matriculasAtivas = matriculaService.listarPorTurma(id).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .count();
        Integer capacidade = turma.getCapacidade();
        long vagasDisponiveis = capacidade == null ? -1 : capacidade - matriculasAtivas;
        return Map.of(
                "capacidade", capacidade != null ? capacidade : "ilimitada",
                "matriculasAtivas", matriculasAtivas,
                "vagasDisponiveis", vagasDisponiveis < 0 ? "ilimitada" : vagasDisponiveis
        );
    }

    // ----- helper -----

    private Turma toModel(TurmaRequest req) {
        Turma turma = new Turma();
        turma.setCodigo(req.getCodigo());
        turma.setHorario(req.getHorario());
        turma.setLocalidade(req.getLocalidade());
        turma.setCapacidade(req.getCapacidade());
        turma.setDataIn(req.getDataIn());
        turma.setDataOut(req.getDataOut());
        if (req.getDisciplina() != null) {
            Disciplina d = new Disciplina();
            d.setId(req.getDisciplina().getId());
            turma.setDisciplina(d);
        }
        if (req.getProfessor() != null) {
            Professor p = new Professor();
            p.setId(req.getProfessor().getId());
            turma.setProfessor(p);
        }
        return turma;
    }
}
