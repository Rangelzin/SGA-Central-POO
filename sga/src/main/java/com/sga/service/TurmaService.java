package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Aluno;
import com.sga.model.Disciplina;
import com.sga.model.Matriculado;
import com.sga.model.Professor;
import com.sga.model.Turma;
import com.sga.repository.DisciplinaRepository;
import com.sga.repository.MatriculadoRepository;
import com.sga.repository.ProfessorRepository;
import com.sga.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Regras de negócio de gerenciamento de turmas (RF-04, parte de CRUD).
 * <p>
 * A gestão de <b>vagas</b> está pendente: a entidade {@link Turma} ainda não
 * modela capacidade — ver a pendência registrada na ALTA-3 e o
 * {@code MatriculaService}.
 *
 * @author SGA Team
 * @since 2026-06-25
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TurmaService {

    private final TurmaRepository turmaRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final ProfessorRepository professorRepository;
    private final MatriculadoRepository matriculadoRepository;

    /** Lista turmas com paginação. */
    @Transactional(readOnly = true)
    public Page<Turma> listar(Pageable pageable) {
        return turmaRepository.findAll(pageable);
    }

    /** Busca uma turma por id ou lança {@link ResourceNotFoundException}. */
    @Transactional(readOnly = true)
    public Turma buscarPorId(UUID id) {
        return turmaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turma", id));
    }

    /**
     * Cria uma turma: valida código único (regra de negócio) e resolve os
     * vínculos obrigatórios com disciplina e professor.
     */
    @Transactional
    public Turma criar(Turma dados) {
        validarCodigoUnico(dados.getCodigo(), null);
        validarCapacidade(dados.getCapacidade());

        Turma turma = new Turma();
        turma.setCodigo(dados.getCodigo());
        turma.setHorario(dados.getHorario());
        turma.setLocalidade(dados.getLocalidade());
        turma.setCapacidade(dados.getCapacidade());
        turma.setDataIn(dados.getDataIn());
        turma.setDataOut(dados.getDataOut());
        turma.setDisciplina(resolverDisciplina(dados.getDisciplina()));
        turma.setProfessor(resolverProfessor(dados.getProfessor()));

        Turma salva = turmaRepository.save(turma);
        log.info("Turma criada: id={}, codigo={}", salva.getId(), salva.getCodigo());
        return salva;
    }

    /** Atualiza os dados de uma turma; disciplina/professor só quando informados. */
    @Transactional
    public Turma atualizar(UUID id, Turma dados) {
        Turma turma = buscarPorId(id);

        validarCodigoUnico(dados.getCodigo(), turma);
        validarCapacidade(dados.getCapacidade());

        turma.setCodigo(dados.getCodigo());
        turma.setHorario(dados.getHorario());
        turma.setLocalidade(dados.getLocalidade());
        turma.setCapacidade(dados.getCapacidade());
        turma.setDataIn(dados.getDataIn());
        turma.setDataOut(dados.getDataOut());

        if (dados.getDisciplina() != null) {
            turma.setDisciplina(resolverDisciplina(dados.getDisciplina()));
        }
        if (dados.getProfessor() != null) {
            turma.setProfessor(resolverProfessor(dados.getProfessor()));
        }

        log.info("Turma atualizada: id={}", id);
        return turma; // dirty checking
    }

    /**
     * Remove uma turma (exclusão lógica). Bloqueia quando há alunos matriculados.
     *
     * @throws BusinessException se a turma possuir matrículas
     */
    @Transactional
    public void deletar(UUID id) {
        Turma turma = buscarPorId(id);

        if (!matriculadoRepository.findByTurmaId(id).isEmpty()) {
            throw new BusinessException("Turma possui alunos matriculados e não pode ser removida.");
        }

        turmaRepository.delete(turma);
        log.info("Turma removida: id={}", id);
    }

    /** Lista as matrículas de uma turma. */
    @Transactional(readOnly = true)
    public List<Matriculado> listarMatriculados(UUID turmaId) {
        return matriculadoRepository.findByTurmaId(turmaId);
    }

    /** Lista os alunos matriculados em uma turma. */
    @Transactional(readOnly = true)
    public List<Aluno> listarAlunos(UUID turmaId) {
        return matriculadoRepository.findByTurmaId(turmaId).stream()
                .map(Matriculado::getAluno)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private void validarCodigoUnico(String codigo, Turma atual) {
        if (codigo == null || codigo.isBlank()) {
            throw new BusinessException("Código da turma é obrigatório.");
        }
        boolean mudou = atual == null || !codigo.equals(atual.getCodigo());
        if (mudou && turmaRepository.findByCodigo(codigo).isPresent()) {
            throw new ConflictException("Já existe uma turma com o código " + codigo + ".");
        }
    }

    private void validarCapacidade(Integer capacidade) {
        if (capacidade != null && capacidade <= 0) {
            throw new BusinessException("Capacidade da turma deve ser maior que zero.");
        }
    }

    private Disciplina resolverDisciplina(Disciplina referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new BusinessException("Disciplina é obrigatória.");
        }
        return disciplinaRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina", referencia.getId()));
    }

    private Professor resolverProfessor(Professor referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new BusinessException("Professor é obrigatório.");
        }
        return professorRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Professor", referencia.getId()));
    }
}
