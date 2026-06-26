package com.sga.service;

import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Matriculado;
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
public class RelatorioService {

    private final MatriculadoRepository matriculadoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;

    @Transactional(readOnly = true)
    public List<Matriculado> historicoAluno(UUID alunoId) {
        if (!alunoRepository.existsById(alunoId)) {
            throw new ResourceNotFoundException("Aluno", alunoId);
        }
        return matriculadoRepository.findByAlunoId(alunoId);
    }

    @Transactional(readOnly = true)
    public List<Matriculado> relatorioTurma(UUID turmaId) {
        if (!turmaRepository.existsById(turmaId)) {
            throw new ResourceNotFoundException("Turma", turmaId);
        }
        return matriculadoRepository.findByTurmaId(turmaId);
    }

    @Transactional(readOnly = true)
    public ResumoAprovacao resumoAprovacaoTurma(UUID turmaId) {
        List<Matriculado> matriculas = relatorioTurma(turmaId);

        long aprovados = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.APROVADO)
                .count();
        long reprovados = matriculas.stream()
                .filter(m -> m.getStatus() == StatusMatricula.REPROVADO)
                .count();

        long finalizados = aprovados + reprovados;
        double percentualAprovacao = finalizados == 0 ? 0.0 : (aprovados * 100.0) / finalizados;

        return new ResumoAprovacao(matriculas.size(), aprovados, reprovados, percentualAprovacao);
    }

    public record ResumoAprovacao(long total, long aprovados, long reprovados, double percentualAprovacao) {
    }
}
