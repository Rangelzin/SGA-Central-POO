package com.sga.service;

import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Matriculado;
import com.sga.model.enums.StatusMatricula;
import com.sga.repository.AlunoRepository;
import com.sga.repository.MatriculadoRepository;
import com.sga.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {

    @Mock
    private MatriculadoRepository matriculadoRepository;
    @Mock
    private AlunoRepository alunoRepository;
    @Mock
    private TurmaRepository turmaRepository;

    @InjectMocks
    private RelatorioService service;

    private Matriculado comStatus(StatusMatricula status) {
        Matriculado m = new Matriculado();
        m.setStatus(status);
        return m;
    }

    @Test
    void deveRetornarHistoricoDoAluno() {
        UUID id = UUID.randomUUID();
        List<Matriculado> historico = List.of(new Matriculado(), new Matriculado());
        when(alunoRepository.existsById(id)).thenReturn(true);
        when(matriculadoRepository.findByAlunoId(id)).thenReturn(historico);

        assertThat(service.historicoAluno(id)).isEqualTo(historico);
    }

    @Test
    void deveLancarNotFoundParaAlunoInexistente() {
        UUID id = UUID.randomUUID();
        when(alunoRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.historicoAluno(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveLancarNotFoundParaTurmaInexistente() {
        UUID id = UUID.randomUUID();
        when(turmaRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> service.relatorioTurma(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveCalcularResumoDeAprovacaoDaTurma() {
        UUID id = UUID.randomUUID();
        when(turmaRepository.existsById(id)).thenReturn(true);
        when(matriculadoRepository.findByTurmaId(id)).thenReturn(List.of(
                comStatus(StatusMatricula.APROVADO),
                comStatus(StatusMatricula.APROVADO),
                comStatus(StatusMatricula.REPROVADO)));

        RelatorioService.ResumoAprovacao resumo = service.resumoAprovacaoTurma(id);

        assertThat(resumo.total()).isEqualTo(3);
        assertThat(resumo.aprovados()).isEqualTo(2);
        assertThat(resumo.reprovados()).isEqualTo(1);
        assertThat(resumo.percentualAprovacao()).isCloseTo(66.66, org.assertj.core.data.Offset.offset(0.01));
    }
}
