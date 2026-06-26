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

@Service
@RequiredArgsConstructor
@Slf4j
public class MatriculaService {

    private final MatriculadoRepository matriculadoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;

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

    @Transactional
    public void cancelar(UUID matriculaId) {
        Matriculado matricula = buscarPorId(matriculaId);

        if (matricula.getStatus() == StatusMatricula.CANCELADA) {
            throw new BusinessException("Matrícula já está cancelada.");
        }

        matricula.setStatus(StatusMatricula.CANCELADA);
        log.info("Matrícula cancelada: id={}", matriculaId);
    }

    private void validarVagaDisponivel(Turma turma, UUID turmaId) {
        Integer capacidade = turma.getCapacidade();
        if (capacidade == null) {
            return;
        }
        long matriculasAtivas = matriculadoRepository.findByTurmaId(turmaId).stream()
                .filter(m -> m.getStatus() == StatusMatricula.ATIVA)
                .count();
        if (matriculasAtivas >= capacidade) {
            throw new BusinessException("Turma sem vagas disponíveis.");
        }
    }

    @Transactional(readOnly = true)
    public Matriculado buscarPorId(UUID matriculaId) {
        return matriculadoRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula", matriculaId));
    }

    @Transactional(readOnly = true)
    public List<Matriculado> listarPorAluno(UUID alunoId) {
        return matriculadoRepository.findByAlunoId(alunoId);
    }

    @Transactional(readOnly = true)
    public List<Matriculado> listarPorTurma(UUID turmaId) {
        return matriculadoRepository.findByTurmaId(turmaId);
    }
}
