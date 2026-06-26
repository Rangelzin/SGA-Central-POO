package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Avalia;
import com.sga.model.Matriculado;
import com.sga.model.enums.StatusMatricula;
import com.sga.model.enums.TipoAvaliacao;
import com.sga.repository.AvaliaRepository;
import com.sga.repository.MatriculadoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

/**
 * Regras de negócio de avaliações: registro de notas/frequência e cálculo de
 * situação acadêmica (RF-05).
 * <p>
 * A nota consolidada de um {@link Matriculado} ({@code matriculado.nota}) é a
 * <b>média ponderada</b> das notas de suas avaliações pelos respectivos pesos
 * ({@link Avalia#getPeso()}). Avaliações sem peso definido contam como peso 1.
 *
 * @author SGA Team
 * @since 2026-06-25
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AvaliacaoService {

    /** Média mínima para aprovação. */
    private static final BigDecimal NOTA_APROVACAO = new BigDecimal("6.0");
    /** Frequência mínima (%) para aprovação. */
    private static final int FREQUENCIA_MINIMA = 75;

    private final MatriculadoRepository matriculadoRepository;
    private final AvaliaRepository avaliaRepository;

    /**
     * Registra uma nota (avaliação) para um matriculado e recalcula a média
     * consolidada da matrícula.
     *
     * @param peso peso da avaliação na média ponderada; {@code null} conta como 1
     * @throws ResourceNotFoundException se a matrícula não existir
     * @throws BusinessException         se a nota for nula ou fora de [0, 10],
     *                                   ou se o peso for ≤ 0
     */
    @Transactional
    public Avalia registrarNota(UUID matriculadoId, BigDecimal nota, BigDecimal peso, TipoAvaliacao tipo, String descricao) {
        Matriculado matriculado = buscarMatriculado(matriculadoId);
        validarNota(nota);
        validarPeso(peso);

        Avalia avaliacao = new Avalia();
        avaliacao.setMatriculado(matriculado);
        avaliacao.setNota(nota);
        avaliacao.setPeso(peso);
        avaliacao.setTipo(tipo);
        avaliacao.setDescricao(descricao);

        Avalia salva = avaliaRepository.save(avaliacao);
        recalcularMedia(matriculadoId, matriculado);

        log.info("Nota registrada: matriculadoId={}, nota={}, tipo={}", matriculadoId, nota, tipo);
        return salva;
    }

    /**
     * Registra a frequência (%) de um matriculado.
     *
     * @throws ResourceNotFoundException se a matrícula não existir
     * @throws BusinessException         se a frequência estiver fora de [0, 100]
     */
    @Transactional
    public Matriculado registrarFrequencia(UUID matriculadoId, Integer frequencia) {
        Matriculado matriculado = buscarMatriculado(matriculadoId);

        if (frequencia == null || frequencia < 0 || frequencia > 100) {
            throw new BusinessException("Frequência deve estar entre 0 e 100.");
        }
        matriculado.setFrequencia(frequencia);

        log.info("Frequência registrada: matriculadoId={}, frequencia={}", matriculadoId, frequencia);
        return matriculado;
    }

    /**
     * Calcula e persiste a situação do matriculado: {@link StatusMatricula#APROVADO}
     * quando a média ≥ 6,0 <b>e</b> a frequência ≥ 75%, caso contrário
     * {@link StatusMatricula#REPROVADO}.
     *
     * @throws ResourceNotFoundException se a matrícula não existir
     * @throws BusinessException         se nota ou frequência não estiverem registradas
     */
    @Transactional
    public StatusMatricula calcularSituacao(UUID matriculadoId) {
        Matriculado matriculado = buscarMatriculado(matriculadoId);

        if (matriculado.getNota() == null || matriculado.getFrequencia() == null) {
            throw new BusinessException("Matrícula sem nota e/ou frequência registradas.");
        }

        boolean aprovado = matriculado.getNota().compareTo(NOTA_APROVACAO) >= 0
                && matriculado.getFrequencia() >= FREQUENCIA_MINIMA;

        StatusMatricula situacao = aprovado ? StatusMatricula.APROVADO : StatusMatricula.REPROVADO;
        matriculado.setStatus(situacao);

        log.info("Situação calculada: matriculadoId={}, media={}, freq={}, situacao={}",
                matriculadoId, matriculado.getNota(), matriculado.getFrequencia(), situacao);
        return situacao;
    }

    private Matriculado buscarMatriculado(UUID matriculadoId) {
        return matriculadoRepository.findById(matriculadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula", matriculadoId));
    }

    private void validarNota(BigDecimal nota) {
        if (nota == null) {
            throw new BusinessException("Nota é obrigatória.");
        }
        if (nota.compareTo(BigDecimal.ZERO) < 0 || nota.compareTo(BigDecimal.TEN) > 0) {
            throw new BusinessException("Nota deve estar entre 0 e 10.");
        }
    }

    private void validarPeso(BigDecimal peso) {
        if (peso != null && peso.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Peso da avaliação deve ser maior que zero.");
        }
    }

    /**
     * Recalcula {@code matriculado.nota} como a média ponderada das notas das
     * avaliações da matrícula: {@code Σ(nota·peso) / Σ(peso)}. Avaliações sem
     * peso definido contam como peso 1.
     */
    private void recalcularMedia(UUID matriculadoId, Matriculado matriculado) {
        List<Avalia> avaliacoes = avaliaRepository.findAvaliacoesByMatriculado(matriculadoId).stream()
                .filter(a -> a.getNota() != null)
                .toList();

        BigDecimal somaPonderada = BigDecimal.ZERO;
        BigDecimal somaPesos = BigDecimal.ZERO;
        for (Avalia avaliacao : avaliacoes) {
            BigDecimal peso = avaliacao.getPeso() != null ? avaliacao.getPeso() : BigDecimal.ONE;
            somaPonderada = somaPonderada.add(avaliacao.getNota().multiply(peso));
            somaPesos = somaPesos.add(peso);
        }

        if (somaPesos.compareTo(BigDecimal.ZERO) == 0) {
            matriculado.setNota(null);
            return;
        }

        BigDecimal media = somaPonderada.divide(somaPesos, 2, RoundingMode.HALF_UP);
        matriculado.setNota(media);
    }
}
