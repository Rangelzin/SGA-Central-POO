package com.sga.controller;

import com.sga.controller.dto.DisciplinaRequest;
import com.sga.controller.dto.DisciplinaResponse;
import com.sga.controller.dto.TurmaResponse;
import com.sga.model.Departamento;
import com.sga.model.Disciplina;
import com.sga.repository.TurmaRepository;
import com.sga.service.DisciplinaService;
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
public class DisciplinaController {

    private final DisciplinaService disciplinaService;
    private final TurmaRepository turmaRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public Page<DisciplinaResponse> listar(
            @PageableDefault(size = 20, sort = "codigo") Pageable pageable) {
        return disciplinaService.listar(pageable).map(DisciplinaResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public DisciplinaResponse criar(@RequestBody @Valid DisciplinaRequest request) {
        return new DisciplinaResponse(disciplinaService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public DisciplinaResponse detalhar(@PathVariable Long id) {
        return new DisciplinaResponse(disciplinaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DisciplinaResponse atualizar(@PathVariable Long id,
                                        @RequestBody @Valid DisciplinaRequest request) {
        return new DisciplinaResponse(disciplinaService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
        disciplinaService.deletar(id);
    }

    @PutMapping("/{id}/ativar")
    @PreAuthorize("hasRole('ADMIN')")
    public DisciplinaResponse ativar(@PathVariable Long id) {
        return new DisciplinaResponse(disciplinaService.ativar(id));
    }

    @GetMapping("/{id}/turmas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
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
