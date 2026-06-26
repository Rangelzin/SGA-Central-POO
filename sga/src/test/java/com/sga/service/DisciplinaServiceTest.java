package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Departamento;
import com.sga.model.Disciplina;
import com.sga.model.Professor;
import com.sga.model.Turma;
import com.sga.repository.DepartamentoRepository;
import com.sga.repository.DisciplinaRepository;
import com.sga.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DisciplinaServiceTest {

    @Mock
    private DisciplinaRepository disciplinaRepository;
    @Mock
    private DepartamentoRepository departamentoRepository;
    @Mock
    private TurmaRepository turmaRepository;

    @InjectMocks
    private DisciplinaService service;

    private Disciplina novaDisciplinaValida() {
        Departamento dep = new Departamento();
        dep.setId(1L);

        Disciplina d = new Disciplina();
        d.setCodigo("MAT101");
        d.setCargaHoraria(60);
        d.setDepartamento(dep);
        return d;
    }

    @Test
    void deveCriarDisciplina() {
        Disciplina dados = novaDisciplinaValida();
        when(disciplinaRepository.existsByCodigo("MAT101")).thenReturn(false);
        when(departamentoRepository.findById(1L)).thenReturn(Optional.of(dados.getDepartamento()));
        when(disciplinaRepository.save(any(Disciplina.class))).thenAnswer(inv -> inv.getArgument(0));

        Disciplina salva = service.criar(dados);

        assertThat(salva.getCodigo()).isEqualTo("MAT101");
        assertThat(salva.getCargaHoraria()).isEqualTo(60);
        verify(disciplinaRepository).save(any(Disciplina.class));
    }

    @Test
    void deveRejeitarCodigoDuplicado() {
        Disciplina dados = novaDisciplinaValida();
        when(disciplinaRepository.existsByCodigo("MAT101")).thenReturn(true);

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(ConflictException.class);

        verify(disciplinaRepository, never()).save(any());
    }

    @Test
    void deveRejeitarCargaHorariaInvalida() {
        Disciplina dados = novaDisciplinaValida();
        dados.setCargaHoraria(0);
        when(disciplinaRepository.existsByCodigo("MAT101")).thenReturn(false);

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(BusinessException.class);

        verify(disciplinaRepository, never()).save(any());
    }

    @Test
    void deveLancarNotFoundAoBuscarIdInexistente() {
        when(disciplinaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveBloquearRemocaoComTurmasVinculadas() {
        Disciplina disciplina = new Disciplina();
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.of(disciplina));
        when(turmaRepository.findTurmaByDisciplina(1L)).thenReturn(List.of(new Turma()));

        assertThatThrownBy(() -> service.deletar(1L))
                .isInstanceOf(BusinessException.class);

        verify(disciplinaRepository, never()).delete(any());
    }

    @Test
    void deveRemoverDisciplinaSemTurmas() {
        Disciplina disciplina = new Disciplina();
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.of(disciplina));
        when(turmaRepository.findTurmaByDisciplina(1L)).thenReturn(List.of());

        service.deletar(1L);

        verify(disciplinaRepository).delete(disciplina);
    }

    @Test
    void deveAtivarDisciplinaComTurmaQueTemProfessor() {
        Disciplina disciplina = new Disciplina();
        Turma turma = new Turma();
        turma.setProfessor(new Professor());
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.of(disciplina));
        when(turmaRepository.findTurmaByDisciplina(1L)).thenReturn(List.of(turma));

        service.ativar(1L);

        assertThat(disciplina.isAtivo()).isTrue();
    }

    @Test
    void deveBloquearAtivacaoSemProfessorResponsavel() {
        Disciplina disciplina = new Disciplina();
        Turma turmaSemProfessor = new Turma();
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.of(disciplina));
        when(turmaRepository.findTurmaByDisciplina(1L)).thenReturn(List.of(turmaSemProfessor));

        assertThatThrownBy(() -> service.ativar(1L))
                .isInstanceOf(BusinessException.class);

        assertThat(disciplina.isAtivo()).isFalse();
    }

    @Test
    void deveDesativarDisciplina() {
        Disciplina disciplina = new Disciplina();
        disciplina.setAtivo(true);
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.of(disciplina));

        service.desativar(1L);

        assertThat(disciplina.isAtivo()).isFalse();
    }
}
