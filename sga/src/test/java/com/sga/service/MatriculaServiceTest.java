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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class MatriculaServiceTest {

    @Mock
    private MatriculadoRepository matriculadoRepository;
    @Mock
    private AlunoRepository alunoRepository;
    @Mock
    private TurmaRepository turmaRepository;

    @InjectMocks
    private MatriculaService service;

    @Test
    void deveMatricularAlunoComStatusAtiva() {
        UUID alunoId = UUID.randomUUID();
        UUID turmaId = UUID.randomUUID();
        when(alunoRepository.findById(alunoId)).thenReturn(Optional.of(new Aluno()));
        when(turmaRepository.findById(turmaId)).thenReturn(Optional.of(new Turma()));
        when(matriculadoRepository.existsByAlunoIdAndTurmaId(alunoId, turmaId)).thenReturn(false);
        when(matriculadoRepository.save(any(Matriculado.class))).thenAnswer(inv -> inv.getArgument(0));

        Matriculado matricula = service.matricular(alunoId, turmaId);

        assertThat(matricula.getStatus()).isEqualTo(StatusMatricula.ATIVA);
        verify(matriculadoRepository).save(any(Matriculado.class));
    }

    @Test
    void deveRejeitarMatriculaDuplicada() {
        UUID alunoId = UUID.randomUUID();
        UUID turmaId = UUID.randomUUID();
        when(alunoRepository.findById(alunoId)).thenReturn(Optional.of(new Aluno()));
        when(turmaRepository.findById(turmaId)).thenReturn(Optional.of(new Turma()));
        when(matriculadoRepository.existsByAlunoIdAndTurmaId(alunoId, turmaId)).thenReturn(true);

        assertThatThrownBy(() -> service.matricular(alunoId, turmaId))
                .isInstanceOf(ConflictException.class);

        verify(matriculadoRepository, never()).save(any());
    }

    @Test
    void deveBloquearMatriculaEmTurmaCheia() {
        UUID alunoId = UUID.randomUUID();
        UUID turmaId = UUID.randomUUID();
        Turma turma = new Turma();
        turma.setCapacidade(1);
        Matriculado ativa = new Matriculado();
        ativa.setStatus(StatusMatricula.ATIVA);
        when(alunoRepository.findById(alunoId)).thenReturn(Optional.of(new Aluno()));
        when(turmaRepository.findById(turmaId)).thenReturn(Optional.of(turma));
        when(matriculadoRepository.existsByAlunoIdAndTurmaId(alunoId, turmaId)).thenReturn(false);
        when(matriculadoRepository.findByTurmaId(turmaId)).thenReturn(List.of(ativa));

        assertThatThrownBy(() -> service.matricular(alunoId, turmaId))
                .isInstanceOf(BusinessException.class);

        verify(matriculadoRepository, never()).save(any());
    }

    @Test
    void devePermitirMatriculaComVagaDisponivel() {
        UUID alunoId = UUID.randomUUID();
        UUID turmaId = UUID.randomUUID();
        Turma turma = new Turma();
        turma.setCapacidade(2);
        Matriculado ativa = new Matriculado();
        ativa.setStatus(StatusMatricula.ATIVA);
        when(alunoRepository.findById(alunoId)).thenReturn(Optional.of(new Aluno()));
        when(turmaRepository.findById(turmaId)).thenReturn(Optional.of(turma));
        when(matriculadoRepository.existsByAlunoIdAndTurmaId(alunoId, turmaId)).thenReturn(false);
        when(matriculadoRepository.findByTurmaId(turmaId)).thenReturn(List.of(ativa));
        when(matriculadoRepository.save(any(Matriculado.class))).thenAnswer(inv -> inv.getArgument(0));

        Matriculado matricula = service.matricular(alunoId, turmaId);

        assertThat(matricula.getStatus()).isEqualTo(StatusMatricula.ATIVA);
    }

    @Test
    void deveLancarNotFoundQuandoAlunoNaoExiste() {
        UUID alunoId = UUID.randomUUID();
        when(alunoRepository.findById(alunoId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.matricular(alunoId, UUID.randomUUID()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(matriculadoRepository, never()).save(any());
    }

    @Test
    void deveCancelarMatriculaAtiva() {
        UUID id = UUID.randomUUID();
        Matriculado matricula = new Matriculado();
        matricula.setStatus(StatusMatricula.ATIVA);
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matricula));

        service.cancelar(id);

        assertThat(matricula.getStatus()).isEqualTo(StatusMatricula.CANCELADA);
    }

    @Test
    void deveRejeitarCancelamentoDeMatriculaJaCancelada() {
        UUID id = UUID.randomUUID();
        Matriculado matricula = new Matriculado();
        matricula.setStatus(StatusMatricula.CANCELADA);
        when(matriculadoRepository.findById(id)).thenReturn(Optional.of(matricula));

        assertThatThrownBy(() -> service.cancelar(id))
                .isInstanceOf(BusinessException.class);
    }
}
