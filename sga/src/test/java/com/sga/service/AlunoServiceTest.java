package com.sga.service;

import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Aluno;
import com.sga.model.Departamento;
import com.sga.model.Matriculado;
import com.sga.model.enums.Role;
import com.sga.repository.AlunoRepository;
import com.sga.repository.DepartamentoRepository;
import com.sga.repository.MatriculadoRepository;
import com.sga.repository.PessoaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class AlunoServiceTest {

    @Mock
    private AlunoRepository alunoRepository;
    @Mock
    private PessoaRepository pessoaRepository;
    @Mock
    private DepartamentoRepository departamentoRepository;
    @Mock
    private MatriculadoRepository matriculadoRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AlunoService service;

    private Aluno novoAlunoValido() {
        Departamento dep = new Departamento();
        dep.setId(1L);

        Aluno a = new Aluno();
        a.setNome("Maria Souza");
        a.setEmail("maria@uni.br");
        a.setCpf("123.456.789-00");
        a.setSenha("senha123");
        a.setDepartamento(dep);
        return a;
    }

    @Test
    void deveCriarAlunoCodificandoSenhaEForcandoRoleAluno() {
        Aluno dados = novoAlunoValido();
        when(pessoaRepository.existsByEmail("maria@uni.br")).thenReturn(false);
        when(pessoaRepository.existsByCpf("123.456.789-00")).thenReturn(false);
        when(departamentoRepository.findById(1L)).thenReturn(Optional.of(dados.getDepartamento()));
        when(passwordEncoder.encode("senha123")).thenReturn("hash");
        when(alunoRepository.save(any(Aluno.class))).thenAnswer(inv -> inv.getArgument(0));

        Aluno salvo = service.criar(dados);

        assertThat(salvo.getRole()).isEqualTo(Role.ALUNO);
        assertThat(salvo.getSenha()).isEqualTo("hash");
        assertThat(salvo.getDepartamento()).isSameAs(dados.getDepartamento());

        ArgumentCaptor<Aluno> captor = ArgumentCaptor.forClass(Aluno.class);
        verify(alunoRepository).save(captor.capture());
        assertThat(captor.getValue().getEmail()).isEqualTo("maria@uni.br");
    }

    @Test
    void deveRejeitarEmailDuplicado() {
        Aluno dados = novoAlunoValido();
        when(pessoaRepository.existsByEmail("maria@uni.br")).thenReturn(true);

        assertThatThrownBy(() -> service.criar(dados))
                .isInstanceOf(ConflictException.class);

        verify(alunoRepository, never()).save(any());
    }

    @Test
    void deveLancarNotFoundAoBuscarIdInexistente() {
        UUID id = UUID.randomUUID();
        when(alunoRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deveRemoverAlunoECascatearMatriculas() {
        UUID id = UUID.randomUUID();
        Aluno aluno = new Aluno();
        List<Matriculado> matriculas = List.of(new Matriculado(), new Matriculado());
        when(alunoRepository.findById(id)).thenReturn(Optional.of(aluno));
        when(matriculadoRepository.findByAlunoId(id)).thenReturn(matriculas);

        service.deletar(id);

        verify(matriculadoRepository).deleteAll(matriculas);
        verify(alunoRepository).delete(aluno);
    }
}
