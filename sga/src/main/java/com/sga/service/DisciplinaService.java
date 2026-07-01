package com.sga.service;

import com.sga.exception.BusinessException;
import com.sga.exception.ConflictException;
import com.sga.exception.ResourceNotFoundException;
import com.sga.model.Departamento;
import com.sga.model.Disciplina;
import com.sga.repository.DepartamentoRepository;
import com.sga.repository.DisciplinaRepository;
import com.sga.repository.TurmaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final TurmaRepository turmaRepository;

    @Transactional(readOnly = true)
    public Page<Disciplina> listar(Pageable pageable) {
        return disciplinaRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Disciplina buscarPorId(Long id) {
        return disciplinaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina", id));
    }

    @Transactional
    public Disciplina criar(Disciplina dados) {
        validarCodigoUnico(dados.getCodigo(), null);
        validarNome(dados.getNome());
        validarCargaHoraria(dados.getCargaHoraria());

        Disciplina disciplina = new Disciplina();
        disciplina.setCodigo(dados.getCodigo());
        disciplina.setNome(dados.getNome());
        disciplina.setTipo(dados.getTipo());
        disciplina.setCargaHoraria(dados.getCargaHoraria());
        disciplina.setEmenta(dados.getEmenta());
        disciplina.setPreRequisito(dados.getPreRequisito());
        disciplina.setDepartamento(resolverDepartamento(dados.getDepartamento()));

        Disciplina salva = disciplinaRepository.save(disciplina);
        log.info("Disciplina criada: id={}, codigo={}", salva.getId(), salva.getCodigo());
        return salva;
    }

    @Transactional
    public Disciplina atualizar(Long id, Disciplina dados) {
        Disciplina disciplina = buscarPorId(id);

        validarCodigoUnico(dados.getCodigo(), disciplina);
        validarNome(dados.getNome());
        validarCargaHoraria(dados.getCargaHoraria());

        disciplina.setCodigo(dados.getCodigo());
        disciplina.setNome(dados.getNome());
        disciplina.setTipo(dados.getTipo());
        disciplina.setCargaHoraria(dados.getCargaHoraria());
        disciplina.setEmenta(dados.getEmenta());
        disciplina.setPreRequisito(dados.getPreRequisito());

        if (dados.getDepartamento() != null) {
            disciplina.setDepartamento(resolverDepartamento(dados.getDepartamento()));
        }

        log.info("Disciplina atualizada: id={}", id);
        return disciplina;
    }

    @Transactional
    public void deletar(Long id) {
        Disciplina disciplina = buscarPorId(id);

        if (!turmaRepository.findTurmaByDisciplina(id).isEmpty()) {
            throw new BusinessException("Disciplina possui turmas vinculadas e não pode ser removida.");
        }

        disciplinaRepository.delete(disciplina);
        log.info("Disciplina removida: id={}", id);
    }

    @Transactional
    public Disciplina ativar(Long id) {
        Disciplina disciplina = buscarPorId(id);

        boolean temProfessorResponsavel = turmaRepository.findTurmaByDisciplina(id).stream()
                .anyMatch(turma -> turma.getProfessor() != null);
        if (!temProfessorResponsavel) {
            throw new BusinessException(
                    "Disciplina não pode ser ativada sem um professor responsável "
                            + "(nenhuma turma com professor atribuído).");
        }

        disciplina.setAtivo(true);
        log.info("Disciplina ativada: id={}", id);
        return disciplina;
    }

    @Transactional
    public Disciplina desativar(Long id) {
        Disciplina disciplina = buscarPorId(id);
        disciplina.setAtivo(false);
        log.info("Disciplina desativada: id={}", id);
        return disciplina;
    }

    private void validarCodigoUnico(String codigo, Disciplina atual) {
        if (codigo == null || codigo.isBlank()) {
            throw new BusinessException("Código da disciplina é obrigatório.");
        }
        boolean mudou = atual == null || !codigo.equals(atual.getCodigo());
        if (mudou && disciplinaRepository.existsByCodigo(codigo)) {
            throw new ConflictException("Já existe uma disciplina com o código " + codigo + ".");
        }
    }

    private void validarCargaHoraria(Integer cargaHoraria) {
        if (cargaHoraria == null || cargaHoraria <= 0) {
            throw new BusinessException("Carga horária deve ser maior que zero.");
        }
    }

    private void validarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new BusinessException("Nome da disciplina é obrigatório.");
        }
    }

    private Departamento resolverDepartamento(Departamento referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new BusinessException("Departamento é obrigatório.");
        }
        return departamentoRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento", referencia.getId()));
    }
}
