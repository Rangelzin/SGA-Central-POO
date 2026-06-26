package com.sga.service;

import com.sga.exception.BusinessException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Regras de negócio de gerenciamento de alunos (RF-01).
 * <p>
 * Concentra as validações (e-mail/CPF únicos, departamento obrigatório) e a
 * orquestração de persistência. A unicidade de e-mail e CPF é verificada contra
 * {@link PessoaRepository} (todas as pessoas), não apenas alunos, pois esses
 * campos são únicos na tabela {@code pessoa}.
 *
 * @author SGA Team
 * @since 2026-06-25
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlunoService {

    private final AlunoRepository alunoRepository;
    private final PessoaRepository pessoaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final MatriculadoRepository matriculadoRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lista alunos com paginação, filtrando opcionalmente por nome (contém, sem
     * diferenciar maiúsculas/minúsculas).
     */
    @Transactional(readOnly = true)
    public Page<Aluno> listar(String nome, Pageable pageable) {
        if (nome != null && !nome.isBlank()) {
            return alunoRepository.findByNomeContainingIgnoreCase(nome.trim(), pageable);
        }
        return alunoRepository.findAll(pageable);
    }

    /** Busca um aluno por id ou lança {@link ResourceNotFoundException}. */
    @Transactional(readOnly = true)
    public Aluno buscarPorId(UUID id) {
        return alunoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aluno", id));
    }

    /**
     * Cria um novo aluno: valida unicidade de e-mail/CPF, exige departamento,
     * codifica a senha e força o papel {@link Role#ALUNO}.
     */
    @Transactional
    public Aluno criar(Aluno dados) {
        validarEmailUnico(dados.getEmail(), null);
        validarCpf(dados.getCpf(), null);

        Aluno aluno = new Aluno();
        aluno.setNome(dados.getNome());
        aluno.setEmail(dados.getEmail());
        aluno.setCpf(dados.getCpf());
        aluno.setMatricula(dados.getMatricula());
        aluno.setDataNascimento(dados.getDataNascimento());
        aluno.setRole(Role.ALUNO);
        aluno.setSenha(passwordEncoder.encode(exigirSenha(dados.getSenha())));
        aluno.setDepartamento(resolverDepartamento(dados.getDepartamento()));

        Aluno salvo = alunoRepository.save(aluno);
        log.info("Aluno criado: id={}, email={}", salvo.getId(), salvo.getEmail());
        return salvo;
    }

    /**
     * Atualiza os dados de um aluno existente. A senha só é alterada quando um
     * novo valor não vazio é informado; o departamento, apenas quando informado.
     */
    @Transactional
    public Aluno atualizar(UUID id, Aluno dados) {
        Aluno aluno = buscarPorId(id);

        validarEmailUnico(dados.getEmail(), aluno);
        validarCpf(dados.getCpf(), aluno);

        aluno.setNome(dados.getNome());
        aluno.setEmail(dados.getEmail());
        aluno.setCpf(dados.getCpf());
        aluno.setMatricula(dados.getMatricula());
        aluno.setDataNascimento(dados.getDataNascimento());

        if (dados.getDepartamento() != null) {
            aluno.setDepartamento(resolverDepartamento(dados.getDepartamento()));
        }
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            aluno.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        log.info("Aluno atualizado: id={}", id);
        return aluno; // alterações persistidas por dirty checking dentro da transação
    }

    /**
     * Remove um aluno (exclusão lógica via {@code @SoftDelete}) junto de suas
     * matrículas (RF-01: cascade delete).
     */
    @Transactional
    public void deletar(UUID id) {
        Aluno aluno = buscarPorId(id);

        List<Matriculado> matriculas = matriculadoRepository.findByAlunoId(id);
        matriculadoRepository.deleteAll(matriculas);
        alunoRepository.delete(aluno);

        log.info("Aluno removido: id={} ({} matrícula(s) removida(s))", id, matriculas.size());
    }

    // ------------------------------------------------------------------
    // Helpers de validação
    // ------------------------------------------------------------------

    private void validarEmailUnico(String email, Aluno atual) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("E-mail é obrigatório.");
        }
        boolean mudou = atual == null || !email.equalsIgnoreCase(atual.getEmail());
        if (mudou && pessoaRepository.existsByEmail(email)) {
            throw new ConflictException("Já existe uma pessoa cadastrada com o e-mail " + email + ".");
        }
    }

    private void validarCpf(String cpf, Aluno atual) {
        if (cpf == null || cpf.isBlank()) {
            throw new BusinessException("CPF é obrigatório.");
        }
        boolean mudou = atual == null || !cpf.equals(atual.getCpf());
        if (mudou && pessoaRepository.existsByCpf(cpf)) {
            throw new ConflictException("Já existe uma pessoa cadastrada com este CPF.");
        }
        // Validação do dígito verificador do CPF: ver MÉDIA-2 (CpfValidator).
    }

    private String exigirSenha(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new BusinessException("Senha é obrigatória.");
        }
        return senha;
    }

    private Departamento resolverDepartamento(Departamento referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new BusinessException("Departamento é obrigatório.");
        }
        return departamentoRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento", referencia.getId()));
    }
}
