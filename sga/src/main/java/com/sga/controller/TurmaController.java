package com.sga.controller;

import com.sga.controller.dto.AlunoResponse;
import com.sga.controller.dto.TurmaRequest;
import com.sga.controller.dto.TurmaResponse;
import com.sga.model.Disciplina;
import com.sga.model.Professor;
import com.sga.model.Turma;
import com.sga.model.enums.StatusMatricula;
import com.sga.service.MatriculaService;
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
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/turmas")
@RequiredArgsConstructor
public class TurmaController {

    private final TurmaService turmaService;
    private final MatriculaService matriculaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public Page<TurmaResponse> listar(
            @PageableDefault(size = 20, sort = "codigo") Pageable pageable) {
        return turmaService.listar(pageable).map(TurmaResponse::new);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TurmaResponse criar(@RequestBody @Valid TurmaRequest request) {
        return new TurmaResponse(turmaService.criar(toModel(request)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public TurmaResponse detalhar(@PathVariable UUID id) {
        return new TurmaResponse(turmaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TurmaResponse atualizar(@PathVariable UUID id,
                                   @RequestBody @Valid TurmaRequest request) {
        return new TurmaResponse(turmaService.atualizar(id, toModel(request)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable UUID id) {
        turmaService.deletar(id);
    }

    @GetMapping("/{id}/alunos")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    public List<AlunoResponse> alunos(@PathVariable UUID id) {
        return turmaService.listarAlunos(id)
                .stream()
                .map(AlunoResponse::new)
                .toList();
    }

    @GetMapping("/{id}/vagas")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
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
