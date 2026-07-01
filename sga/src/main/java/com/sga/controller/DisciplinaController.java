package com.sga.controller;

import com.sga.controller.dto.DisciplinaRequest;
import com.sga.controller.dto.DisciplinaResponse;
import com.sga.controller.dto.TurmaResponse;
import com.sga.model.Departamento;
import com.sga.model.Disciplina;
import com.sga.repository.TurmaRepository;
import com.sga.service.DisciplinaService;
import io.swagger.v3.oas.annotations.Operation;
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

@RestController
@RequestMapping("api/disciplinas")
@RequiredArgsConstructor
@Tag(name = "Disciplinas", description = "Gerenciamento de disciplinas e turmas vinculadas (UC-03)")
@SecurityRequirement(name = "bearerAuth")
public class DisciplinaController {

    private final DisciplinaService disciplinaService;
    private final TurmaRepository turmaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista disciplinas paginado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de disciplinas retornada"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    public Page<DisciplinaResponse> listar(
            @PageableDefault(size = 20, sort = "codigo") Pageable pageable) {
        return disciplinaService.listar(pageable).map(DisciplinaResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cria nova disciplina", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Disciplina criada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "Código já cadastrado")
    })
    public DisciplinaResponse criar(@RequestBody @Valid DisciplinaRequest request) {
        return new DisciplinaResponse(disciplinaService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Busca disciplina por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disciplina encontrada"),
            @ApiResponse(responseCode = "404", description = "Disciplina não encontrada")
    })
    public DisciplinaResponse detalhar(@PathVariable Long id) {
        return new DisciplinaResponse(disciplinaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza disciplina", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disciplina atualizada"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Disciplina não encontrada")
    })
    public DisciplinaResponse atualizar(@PathVariable Long id,
                                        @RequestBody @Valid DisciplinaRequest request) {
        return new DisciplinaResponse(disciplinaService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove disciplina", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Disciplina removida"),
            @ApiResponse(responseCode = "404", description = "Disciplina não encontrada")
    })
    public void deletar(@PathVariable Long id) {
        disciplinaService.deletar(id);
    }

    @PutMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ativa ou reativa disciplina", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disciplina ativada"),
            @ApiResponse(responseCode = "404", description = "Disciplina não encontrada")
    })
    public DisciplinaResponse ativar(@PathVariable Long id) {
        return new DisciplinaResponse(disciplinaService.ativar(id));
    }

    @GetMapping("/{id}/turmas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista turmas de uma disciplina")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Turmas listadas"),
            @ApiResponse(responseCode = "404", description = "Disciplina não encontrada")
    })
    public List<TurmaResponse> turmas(@PathVariable Long id) {
        disciplinaService.buscarPorId(id); // valida existência
        return turmaRepository.findTurmaByDisciplina(id)
                .stream()
                .map(TurmaResponse::new)
                .toList();
    }

    // ----- helper -----

    private Disciplina toModel(DisciplinaRequest req) {
        Disciplina disciplina = new Disciplina();
        disciplina.setCodigo(req.getCodigo());
        disciplina.setTipo(req.getTipo());
        disciplina.setCargaHoraria(req.getCargaHoraria());
        disciplina.setPreRequisito(req.getPreRequisito());
        if (req.getDepartamento() != null) {
            Departamento dep = new Departamento();
            dep.setId(req.getDepartamento().getId());
            disciplina.setDepartamento(dep);
        }
        return disciplina;
    }
}
