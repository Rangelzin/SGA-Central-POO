package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Departamento;
import com.sga.model.Professor;
import com.sga.model.Turma;
import com.sga.model.enums.Role;
import com.sga.repository.DepartamentoRepository;
import com.sga.repository.ProfessorRepository;
import com.sga.repository.TurmaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

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
class ProfessorServiceTest {

    @Mock
    private ProfessorRepository professorRepository;
    @Mock
    private DepartamentoRepository departamentoRepository;
    @Mock
    private TurmaRepository turmaRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private ProfessorService service;

    private Professor novoProfessorValido() {
        Departamento dep = new Departamento();
        dep.setId(1L);

        Professor p = new Professor();
        p.setNome("Ana Lima");
        p.setEmail("ana@uni.br");
        p.setCpf("111.111.111-11");
        p.setSenha("senha123");
        p.setTitulacao("Doutora");
        p.setDepartamento(dep);
        return p;
    }

    @Test
    void deveCriarProfessorCodificandoSenhaEForcandoRoleProfessor() {
        Professor dados = novoProfessorValido();
        when(professorRepository.existsByEmail("ana@uni.br")).thenReturn(false);
        when(professorRepository.existsByCpf("111.111.111-11")).thenReturn(false);
        when(departamentoRepository.findById(1L)).thenReturn(Optional.of(dados.getDepartamento()));
        when(passwordEncoder.encode("senha123")).thenReturn("hash");
        when(professorRepository.save(any(Professor.class))).thenAnswer(inv -> inv.getArgument(0));

        Professor salvo = service.criar(dados);

        assertThat(salvo.getRole()).isEqualTo(Role.PROFESSOR);
        assertThat(salvo.getSenha()).isEqualTo("hash");
        assertThat(salvo.getTitulacao()).isEqualTo("Doutora");
    }

    @Test
    void deveExigirTitulacao() {
        Professor dados = novoProfessorValido();
        dados.setTitulacao("  ");
        when(professorRepository.existsByEmail("ana@uni.br")).thenReturn(false);
        when(professorRepository.existsByCpf("111.111.111-11")).thenReturn(false);

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(BusinessException.class);

        verify(professorRepository, never()).save(any());
    }

    @Test
    void deveRejeitarEmailDuplicado() {
        Professor dados = novoProfessorValido();
        when(professorRepository.existsByEmail("ana@uni.br")).thenReturn(true);

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(ConflictException.class);

        verify(professorRepository, never()).save(any());
    }

    @Test
    void deveLancarNotFoundAoBuscarIdInexistente() {
        UUID id = UUID.randomUUID();
        when(professorRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveBloquearRemocaoComTurmasVinculadas() {
        UUID id = UUID.randomUUID();
        when(professorRepository.findById(id)).thenReturn(Optional.of(new Professor()));
        when(turmaRepository.findTurmaByProfessor(id)).thenReturn(List.of(new Turma()));

        assertThatThrownBy(() -> service.deletar(id))
                .isInstanceOf(BusinessException.class);

        verify(professorRepository, never()).delete(any());
    }

    @Test
    void deveRemoverProfessorSemTurmas() {
        UUID id = UUID.randomUUID();
        Professor professor = new Professor();
        when(professorRepository.findById(id)).thenReturn(Optional.of(professor));
        when(turmaRepository.findTurmaByProfessor(id)).thenReturn(List.of());

        service.deletar(id);

        verify(professorRepository).delete(professor);
    }
}
