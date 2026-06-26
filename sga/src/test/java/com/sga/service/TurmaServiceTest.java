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
class TurmaServiceTest {

    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private DisciplinaRepository disciplinaRepository;
    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private MatriculadoRepository matriculadoRepository;

    @InjectMocks
    private TurmaService service;

    private Turma novaTurmaValida() {
        Disciplina disc = new Disciplina();
        disc.setId(1L);

        Professor prof = new Professor();
        prof.setId(UUID.randomUUID());

        Turma t = new Turma();
        t.setCodigo("T-01");
        t.setDisciplina(disc);
        t.setProfessor(prof);
        return t;
    }

    @Test
    void deveCriarTurmaResolvendoDisciplinaEProfessor() {
        Turma dados = novaTurmaValida();
        UUID profId = dados.getProfessor().getId();
        when(turmaRepository.findByCodigo("T-01")).thenReturn(Optional.empty());
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.of(dados.getDisciplina()));
        when(professorRepository.findById(profId)).thenReturn(Optional.of(dados.getProfessor()));
        when(turmaRepository.save(any(Turma.class))).thenAnswer(inv -> inv.getArgument(0));

        Turma salva = service.criar(dados);

        assertThat(salva.getDisciplina()).isSameAs(dados.getDisciplina());
        assertThat(salva.getProfessor()).isSameAs(dados.getProfessor());
        verify(turmaRepository).save(any(Turma.class));
    }

    @Test
    void deveRejeitarCodigoDuplicado() {
        Turma dados = novaTurmaValida();
        when(turmaRepository.findByCodigo("T-01")).thenReturn(Optional.of(new Turma()));

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(ConflictException.class);

        verify(turmaRepository, never()).save(any());
    }

    @Test
    void deveRejeitarCapacidadeInvalida() {
        Turma dados = novaTurmaValida();
        dados.setCapacidade(0);
        when(turmaRepository.findByCodigo("T-01")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(BusinessException.class);

        verify(turmaRepository, never()).save(any());
    }

    @Test
    void deveLancarNotFoundQuandoDisciplinaNaoExiste() {
        Turma dados = novaTurmaValida();
        when(turmaRepository.findByCodigo("T-01")).thenReturn(Optional.empty());
        when(disciplinaRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(turmaRepository, never()).save(any());
    }

    @Test
    void deveBloquearRemocaoComMatriculados() {
        UUID id = UUID.randomUUID();
        when(turmaRepository.findById(id)).thenReturn(Optional.of(new Turma()));
        when(matriculadoRepository.findByTurmaId(id)).thenReturn(List.of(new Matriculado()));

        assertThatThrownBy(() -> service.deletar(id))
                .isInstanceOf(BusinessException.class);

        verify(turmaRepository, never()).delete(any());
    }

    @Test
    void deveRemoverTurmaSemMatriculados() {
        UUID id = UUID.randomUUID();
        Turma turma = new Turma();
        when(turmaRepository.findById(id)).thenReturn(Optional.of(turma));
        when(matriculadoRepository.findByTurmaId(id)).thenReturn(List.of());

        service.deletar(id);

        verify(turmaRepository).delete(turma);
    }

    @Test
    void deveListarAlunosDistintosDaTurma() {
        UUID id = UUID.randomUUID();
        Aluno aluno = new Aluno();
        Matriculado m1 = new Matriculado();
        m1.setAluno(aluno);
        Matriculado m2 = new Matriculado();
        m2.setAluno(aluno);
        when(matriculadoRepository.findByTurmaId(id)).thenReturn(List.of(m1, m2));

        List<Aluno> alunos = service.listarAlunos(id);

        assertThat(alunos).containsExactly(aluno);
    }
}
