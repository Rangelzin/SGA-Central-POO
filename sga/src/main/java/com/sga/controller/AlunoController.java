package com.sga.controller;

import com.sga.controller.dto.AlunoRequest;
import com.sga.controller.dto.AlunoResponse;
import com.sga.controller.dto.ErrorResponse;
import com.sga.model.Aluno;
import com.sga.model.Departamento;
import com.sga.service.AlunoService;
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

import java.util.UUID;

@RestController
@RequestMapping("api/alunos")
@RequiredArgsConstructor
@Tag(name = "Alunos", description = "Gerenciamento de alunos (UC-01)")
@SecurityRequirement(name = "bearerAuth")
public class AlunoController {

    private final AlunoService alunoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Lista alunos paginado", description = "Filtra por nome (opcional). Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Página de alunos retornada"),
            @ApiResponse(responseCode = "401", description = "Não autenticado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "403", description = "Sem permissão",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Page<AlunoResponse> listar(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return alunoService.listar(nome, pageable).map(AlunoResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cria novo aluno", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Aluno criado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "E-mail ou CPF já cadastrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AlunoResponse criar(@RequestBody @Valid AlunoRequest request) {
        return new AlunoResponse(alunoService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Busca aluno por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluno encontrado"),
            @ApiResponse(responseCode = "404", description = "Aluno não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AlunoResponse detalhar(@PathVariable UUID id) {
        return new AlunoResponse(alunoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Atualiza aluno", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluno atualizado"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Aluno não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public AlunoResponse atualizar(@PathVariable UUID id,
                                   @RequestBody @Valid AlunoRequest request) {
        return new AlunoResponse(alunoService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove aluno", description = "Requer ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Aluno removido",
                    content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Aluno não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void deletar(@PathVariable UUID id) {
        alunoService.deletar(id);
    }

    // ----- helper -----

    private Aluno toModel(AlunoRequest req) {
        Aluno aluno = new Aluno();
        aluno.setNome(req.getNome());
        aluno.setEmail(req.getEmail());
        aluno.setCpf(req.getCpf());
        aluno.setMatricula(req.getMatricula());
        aluno.setDataNascimento(req.getDataNascimento());
        aluno.setSenha(req.getSenha());
        if (req.getDepartamento() != null) {
            Departamento dep = new Departamento();
            dep.setId(req.getDepartamento().getId());
            aluno.setDepartamento(dep);
        }
        return aluno;
    }
}
