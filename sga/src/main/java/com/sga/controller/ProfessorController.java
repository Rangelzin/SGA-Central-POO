package com.sga.controller;

import com.sga.controller.dto.ProfessorRequest;
import com.sga.controller.dto.ProfessorResponse;
import com.sga.controller.dto.TurmaResponse;
import com.sga.model.Departamento;
import com.sga.model.Professor;
import com.sga.service.ProfessorService;
import com.sga.service.TurmaService;
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
public class ProfessorController {

    private final ProfessorService professorService;
    private final TurmaService turmaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public Page<ProfessorResponse> listar(
            @RequestParam(required = false) String nome,
            @PageableDefault(size = 20, sort = "nome") Pageable pageable) {
        return professorService.listar(nome, pageable).map(ProfessorResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessorResponse criar(@RequestBody @Valid ProfessorRequest request) {
        return new ProfessorResponse(professorService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public ProfessorResponse detalhar(@PathVariable UUID id) {
        return new ProfessorResponse(professorService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProfessorResponse atualizar(@PathVariable UUID id,
                                       @RequestBody @Valid ProfessorRequest request) {
        return new ProfessorResponse(professorService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable UUID id) {
        professorService.deletar(id);
    }

    @GetMapping("/{id}/turmas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
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
