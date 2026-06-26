package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Aluno;
import com.sga.model.Matriculado;
import com.sga.model.Turma;
import com.sga.model.enums.StatusMatricula;
import com.sga.repository.AlunoRepository;
import com.sga.repository.MatriculadoRepository;
import com.sga.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Regras de negócio de matrícula de alunos em turmas (RF-04).
 * <p>
 * Cobre a criação de matrícula, o cancelamento e a consulta. A validação de
 * <b>vagas disponíveis</b> está pendente: a entidade/tabela {@code turma} ainda
 * não modela capacidade (ver TODO em {@link #matricular(UUID, UUID)} e a
 * pendência registrada na ALTA-3).
 *
 * @author SGA Team
 * @since 2026-06-25
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MatriculaService {

    private final MatriculadoRepository matriculadoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;

    /**
     * Matricula um aluno em uma turma.
     *
     * @throws ResourceNotFoundException se o aluno ou a turma não existirem
     * @throws ConflictException         se o aluno já estiver matriculado nessa turma
     */
    @Transactional
    public Matriculado matricular(UUID alunoId, UUID turmaId) {
        Aluno aluno = alunoRepository.findById(alunoId)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno", alunoId));
        Turma turma = turmaRepository.findById(turmaId)
                .orElseThrow(() -> new ResourceNotFoundException("Turma", turmaId));

        if (matriculadoRepository.existsByAlunoIdAndTurmaId(alunoId, turmaId)) {
            throw new ConflictException("Aluno já está matriculado nesta turma.");
        }

        validarVagaDisponivel(turma, turmaId);

        Matriculado matricula = new Matriculado();
        matricula.setAluno(aluno);
        matricula.setTurma(turma);
        matricula.setStatus(StatusMatricula.ATIVA);

        Matriculado salva = matriculadoRepository.save(matricula);
        log.info("Matrícula criada: id={}, alunoId={}, turmaId={}", salva.getId(), alunoId, turmaId);
        return salva;
    }

    /**
     * Cancela uma matrícula existente, marcando o status como
     * {@link StatusMatricula#CANCELADA} (o registro é mantido para histórico).
     *
     * @throws ResourceNotFoundException se a matrícula não existir
     * @throws BusinessException         se a matrícula já estiver cancelada
     */
    @Transactional
    public void cancelar(UUID matriculaId) {
        Matriculado matricula = buscarPorId(matriculaId);

        if (matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Matrícula já está cancelada.");
        }

        matricula.setStatus(StatusMatricula.CANCELADA);
        log.info("Matrícula cancelada: id={}", matriculaId);
    }

    /**
     * Valida se a turma possui vaga disponível (RF-04). Conta apenas matrículas
     * com status {@link StatusMatricula#ATIVA}. Turmas com capacidade {@code null}
     * são tratadas como sem limite.
     *
     * @throws BusinessException se a turma estiver lotada
     */
    private void validarVagaDisponivel(Turma turma, UUID turmaId) {
        Integer capacidade = turma.getCapacidade();
        if (capacidade == null) {
            return; // sem limite definido
        }
        long matriculasAtivas = matriculadoRepository.findByTurmaId(turmaId).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .count();
        if (matriculasAtivas >= capacidade) {
            throw new BusinessException("Turma sem vagas disponíveis.");
        }
    }

    /** Busca uma matrícula por id ou lança {@link ResourceNotFoundException}. */
    @Transactional(readOnly = true)
    public Matriculado buscarPorId(UUID matriculaId) {
        return matriculadoRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula", matriculaId));
    }

    /** Lista as matrículas de um aluno (histórico de inscrições). */
    @Transactional(readOnly = true)
    public List<Matriculado> listarPorAluno(UUID alunoId) {
        return matriculadoRepository.findByAlunoId(alunoId);
    }

    /** Lista as matrículas de uma turma. */
    @Transactional(readOnly = true)
    public List<Matriculado> listarPorTurma(UUID turmaId) {
        return matriculadoRepository.findByTurmaId(turmaId);
    }
}
