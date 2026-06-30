package com.sga.controller;

import com.sga.controller.dto.AlunoRequest;
import com.sga.controller.dto.AlunoResponse;
import com.sga.model.Aluno;
import com.sga.model.Departamento;
import com.sga.service.AlunoService;
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
public class AlunoController {

    private final AlunoService alunoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public Page<AlunoResponse> listar(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return alunoService.listar(nome, pageable).map(AlunoResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public AlunoResponse criar(@RequestBody @Valid AlunoRequest request) {
        return new AlunoResponse(alunoService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public AlunoResponse detalhar(@PathVariable UUID id) {
        return new AlunoResponse(alunoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public AlunoResponse atualizar(@PathVariable UUID id,
                                   @RequestBody @Valid AlunoRequest request) {
        return new AlunoResponse(alunoService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
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
