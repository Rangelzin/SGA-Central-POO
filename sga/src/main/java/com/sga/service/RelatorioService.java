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

/**
 * Relatórios acadêmicos: histórico do aluno (RF-06) e relatório de turma (RF-07).
 * <p>
 * Apenas agrega dados já persistidos nas matrículas; não altera estado. O
 * relatório de aprovação é exposto como um <i>read-model</i>
 * ({@link ResumoAprovacao}) calculado em tempo de consulta.
 *
 * @author SGA Team
 * @since 2026-06-25
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RelatorioService {

    private final MatriculadoRepository matriculadoRepository;
    private final AlunoRepository alunoRepository;
    private final TurmaRepository turmaRepository;

    /**
     * Histórico acadêmico do aluno (RF-06): todas as suas matrículas, com nota,
     * frequência e status.
     *
     * @throws ResourceNotFoundException se o aluno não existir
     */
    @Transactional(readOnly = true)
    public List<Matriculado> historicoAluno(UUID alunoId) {
        if (!alunoRepository.existsById(alunoId)) {
            throw new ResourceNotFoundException("Aluno", alunoId);
        }
        return matriculadoRepository.findByAlunoId(alunoId);
    }

    /**
     * Relatório de turma (RF-07): lista de matrículas da turma, com notas e
     * frequência.
     *
     * @throws ResourceNotFoundException se a turma não existir
     */
    @Transactional(readOnly = true)
    public List<Matriculado> relatorioTurma(UUID turmaId) {
        if (!turmaRepository.existsById(turmaId)) {
            throw new ResourceNotFoundException("Turma", turmaId);
        }
        return matriculadoRepository.findByTurmaId(turmaId);
    }

    /**
     * Resumo de aprovação de uma turma (RF-07): contagem de aprovados/reprovados
     * e o percentual de aprovação entre as matrículas já finalizadas.
     *
     * @throws ResourceNotFoundException se a turma não existir
     */
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

    /**
     * Read-model do relatório de aprovação de uma turma.
     *
     * @param total                total de matrículas na turma
     * @param aprovados            matrículas com status APROVADO
     * @param reprovados           matrículas com status REPROVADO
     * @param percentualAprovacao  percentual de aprovação entre as finalizadas (0–100)
     */
    public record ResumoAprovacao(long total, long aprovados, long reprovados, double percentualAprovacao) {
    }
}
