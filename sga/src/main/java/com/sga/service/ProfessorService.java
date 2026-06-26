package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Departamento;
import com.sga.model.Professor;
import com.sga.model.enums.Role;
import com.sga.repository.DepartamentoRepository;
import com.sga.repository.PessoaRepository;
import com.sga.repository.ProfessorRepository;
import com.sga.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessorService {

    private final ProfessorRepository professorRepository;
    private final PessoaRepository pessoaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final TurmaRepository turmaRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Page<Professor> listar(String nome, Pageable pageable) {
        if (nome != null && !nome.isBlank()) {
            return professorRepository.findByNomeContainingIgnoreCase(nome.trim(), pageable);
        }
        return professorRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Professor buscarPorId(UUID id) {
        return professorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Professor", id));
    }

    @Transactional
    public Professor criar(Professor dados) {
        validarEmailUnico(dados.getEmail(), null);
        validarCpf(dados.getCpf(), null);

        Professor professor = new Professor();
        professor.setNome(dados.getNome());
        professor.setEmail(dados.getEmail());
        professor.setCpf(dados.getCpf());
        professor.setMatricula(dados.getMatricula());
        professor.setDataNascimento(dados.getDataNascimento());
        professor.setTitulacao(exigirTitulacao(dados.getTitulacao()));
        professor.setRole(Role.PROFESSOR);
        professor.setSenha(passwordEncoder.encode(exigirSenha(dados.getSenha())));
        professor.setDepartamento(resolverDepartamento(dados.getDepartamento()));

        Professor salvo = professorRepository.save(professor);
        log.info("Professor criado: id={}, email={}", salvo.getId(), salvo.getEmail());
        return salvo;
    }

    @Transactional
    public Professor atualizar(UUID id, Professor dados) {
        Professor professor = buscarPorId(id);

        validarEmailUnico(dados.getEmail(), professor);
        validarCpf(dados.getCpf(), professor);

        professor.setNome(dados.getNome());
        professor.setEmail(dados.getEmail());
        professor.setCpf(dados.getCpf());
        professor.setMatricula(dados.getMatricula());
        professor.setDataNascimento(dados.getDataNascimento());
        professor.setTitulacao(exigirTitulacao(dados.getTitulacao()));

        if (dados.getDepartamento() != null) {
            professor.setDepartamento(resolverDepartamento(dados.getDepartamento()));
        }
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            professor.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        log.info("Professor atualizado: id={}", id);
        return professor;
    }

    @Transactional
    public void deletar(UUID id) {
        Professor professor = buscarPorId(id);

        if (!turmaRepository.findTurmaByProfessor(id).isEmpty()) {
            throw new BusinessException("Professor possui turmas vinculadas e não pode ser removido.");
        }

        professorRepository.delete(professor);
        log.info("Professor removido: id={}", id);
    }

    private void validarEmailUnico(String email, Professor atual) {
        if (email == null || email.isBlank()) {
            throw new BusinessException("E-mail é obrigatório.");
        }
        boolean mudou = atual == null || !email.equalsIgnoreCase(atual.getEmail());
        if (mudou && pessoaRepository.existsByEmail(email)) {
            throw new ConflictException("Já existe uma pessoa cadastrada com o e-mail " + email + ".");
        }
    }

    private void validarCpf(String cpf, Professor atual) {
        if (cpf == null || cpf.isBlank()) {
            throw new BusinessException("CPF é obrigatório.");
        }
        boolean mudou = atual == null || !cpf.equals(atual.getCpf());
        if (mudou && pessoaRepository.existsByCpf(cpf)) {
            throw new ConflictException("Já existe uma pessoa cadastrada com este CPF.");
        }
    }

    private String exigirSenha(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new BusinessException("Senha é obrigatória.");
        }
        return senha;
    }

    private String exigirTitulacao(String titulacao) {
        if (titulacao == null || titulacao.isBlank()) {
            throw new BusinessException("Titulação é obrigatória.");
        }
        return titulacao;
    }

    private Departamento resolverDepartamento(Departamento referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new BusinessException("Departamento é obrigatório.");
        }
        return departamentoRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento", referencia.getId()));
    }
}
