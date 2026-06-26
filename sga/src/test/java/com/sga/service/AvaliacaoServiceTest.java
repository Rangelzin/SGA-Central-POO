package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Avalia;
import com.sga.model.Matriculado;
import com.sga.model.enums.StatusMatricula;
import com.sga.model.enums.TipoAvaliacao;
import com.sga.repository.AvaliaRepository;
import com.sga.repository.MatriculadoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AvaliacaoServiceTest {

    @Mock
    private MatriculadoRepository matriculadoRepository;
    @Mock
    private AvaliaRepository avaliaRepository;

    @InjectMocks
    private AvaliacaoService service;

    private Avalia avaliaComNota(String nota) {
        Avalia a = new Avalia();
        a.setNota(new BigDecimal(nota));
        return a;
    }

    private Avalia avaliaComNotaEPeso(String nota, String peso) {
        Avalia a = new Avalia();
        a.setNota(new BigDecimal(nota));
        a.setPeso(new BigDecimal(peso));
        return a;
    }

    @Test
    void deveRegistrarNotaSemPesoRecalcularComoMediaSimples() {
        UUID id = UUID.randomUUID();
        Matriculado matriculado = new Matriculado();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matriculado));
        when(avaliaRepository.save(any(Avalia.class))).thenAnswer(inv -> inv.getArgument(0));
        when(avaliaRepository.findAvaliacoesByMatriculado(id))
                .thenReturn(List.of(avaliaComNota("8.0"), avaliaComNota("6.0")));

        service.registrarNota(id, new BigDecimal("6.0"), null, TipoAvaliacao.PROVA, "P1");

        // pesos nulos contam como 1 → equivale à média simples
        assertThat(matriculado.getNota()).isEqualByComparingTo("7.00");
        verify(avaliaRepository).save(any(Avalia.class));
    }

    @Test
    void deveRecalcularMediaPonderadaPelosPesos() {
        UUID id = UUID.randomUUID();
        Matriculado matriculado = new Matriculado();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matriculado));
        when(avaliaRepository.save(any(Avalia.class))).thenAnswer(inv -> inv.getArgument(0));
        when(avaliaRepository.findAvaliacoesByMatriculado(id))
                .thenReturn(List.of(avaliaComNotaEPeso("10.0", "3"), avaliaComNotaEPeso("5.0", "1")));

        service.registrarNota(id, new BigDecimal("5.0"), new BigDecimal("1"), TipoAvaliacao.PROVA, "P2");

        // (10*3 + 5*1) / (3+1) = 35/4 = 8.75
        assertThat(matriculado.getNota()).isEqualByComparingTo("8.75");
    }

    @Test
    void deveRejeitarNotaForaDoIntervalo() {
        UUID id = UUID.randomUUID();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(new Matriculado()));

        assertThatThrownBy(() -> service.registrarNota(id, new BigDecimal("11"), null, TipoAvaliacao.PROVA, null))
                .isInstanceOf(BusinessException.class);

        verify(avaliaRepository, never()).save(any());
    }

    @Test
    void deveRejeitarPesoInvalido() {
        UUID id = UUID.randomUUID();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(new Matriculado()));

        assertThatThrownBy(() -> service.registrarNota(id, new BigDecimal("7"), new BigDecimal("0"), TipoAvaliacao.PROVA, null))
                .isInstanceOf(BusinessException.class);

        verify(avaliaRepository, never()).save(any());
    }

    @Test
    void deveLancarNotFoundAoRegistrarNotaEmMatriculaInexistente() {
        UUID id = UUID.randomUUID();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.registrarNota(id, new BigDecimal("7"), null, TipoAvaliacao.PROVA, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveRejeitarFrequenciaForaDoIntervalo() {
        UUID id = UUID.randomUUID();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(new Matriculado()));

        assertThatThrownBy(() -> service.registrarFrequencia(id, 120))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void deveRegistrarFrequenciaValida() {
        UUID id = UUID.randomUUID();
        Matriculado matriculado = new Matriculado();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matriculado));

        service.registrarFrequencia(id, 90);

        assertThat(matriculado.getFrequencia()).isEqualTo(90);
    }

    @Test
    void deveAprovarComMediaEFrequenciaSuficientes() {
        UUID id = UUID.randomUUID();
        Matriculado matriculado = new Matriculado();
        matriculado.setNota(new BigDecimal("7.00"));
        matriculado.setFrequencia(80);
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matriculado));

        StatusMatricula situacao = service.calcularSituacao(id);

        assertThat(situacao).isEqualTo(StatusMatricula.APROVADO);
        assertThat(matriculado.getStatus()).isEqualTo(StatusMatricula.APROVADO);
    }

    @Test
    void deveReprovarPorFrequenciaInsuficiente() {
        UUID id = UUID.randomUUID();
        Matriculado matriculado = new Matriculado();
        matriculado.setNota(new BigDecimal("8.00"));
        matriculado.setFrequencia(50);
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matriculado));

        StatusMatricula situacao = service.calcularSituacao(id);

        assertThat(situacao).isEqualTo(StatusMatricula.REPROVADO);
    }

    @Test
    void deveExigirNotaEFrequenciaParaCalcularSituacao() {
        UUID id = UUID.randomUUID();
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(new Matriculado()));

        assertThatThrownBy(() -> service.calcularSituacao(id))
                .isInstanceOf(BusinessException.class);
    }
}
