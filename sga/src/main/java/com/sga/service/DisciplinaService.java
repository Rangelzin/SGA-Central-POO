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

/**
 * Regras de negócio de gerenciamento de disciplinas (RF-03).
 * <p>
 * A ativação ({@link #ativar(Long)}) exige que a disciplina tenha um professor
 * responsável. Como o modelo não vincula professor diretamente à disciplina,
 * o responsável é <b>derivado das turmas</b>: a disciplina é ativável se possuir
 * ao menos uma turma com professor atribuído.
 *
 * @author SGA Team
 * @since 2026-06-25
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DisciplinaService {

    private final DisciplinaRepository disciplinaRepository;
    private final DepartamentoRepository departamentoRepository;
    private final TurmaRepository turmaRepository;

    /** Lista disciplinas com paginação. */
    @Transactional(readOnly = true)
    public Page<Disciplina> listar(Pageable pageable) {
        return disciplinaRepository.findAll(pageable);
    }

    /** Busca uma disciplina por id ou lança {@link ResourceNotFoundException}. */
    @Transactional(readOnly = true)
    public Disciplina buscarPorId(Long id) {
        return disciplinaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina", id));
    }

    /** Cria uma disciplina: valida código único e carga horária, resolve o departamento. */
    @Transactional
    public Disciplina criar(Disciplina dados) {
        validarCodigoUnico(dados.getCodigo(), null);
        validarCargaHoraria(dados.getCargaHoraria());

        Disciplina disciplina = new Disciplina();
        disciplina.setCodigo(dados.getCodigo());
        disciplina.setTipo(dados.getTipo());
        disciplina.setCargaHoraria(dados.getCargaHoraria());
        disciplina.setPreRequisito(dados.getPreRequisito());
        disciplina.setDepartamento(resolverDepartamento(dados.getDepartamento()));

        Disciplina salva = disciplinaRepository.save(disciplina);
        log.info("Disciplina criada: id={}, codigo={}", salva.getId(), salva.getCodigo());
        return salva;
    }

    /** Atualiza os dados de uma disciplina; o departamento só quando informado. */
    @Transactional
    public Disciplina atualizar(Long id, Disciplina dados) {
        Disciplina disciplina = buscarPorId(id);

        validarCodigoUnico(dados.getCodigo(), disciplina);
        validarCargaHoraria(dados.getCargaHoraria());

        disciplina.setCodigo(dados.getCodigo());
        disciplina.setTipo(dados.getTipo());
        disciplina.setCargaHoraria(dados.getCargaHoraria());
        disciplina.setPreRequisito(dados.getPreRequisito());

        if (dados.getDepartamento() != null) {
            disciplina.setDepartamento(resolverDepartamento(dados.getDepartamento()));
        }

        log.info("Disciplina atualizada: id={}", id);
        return disciplina; // dirty checking
    }

    /**
     * Remove uma disciplina (exclusão lógica). Bloqueia quando há turmas vinculadas.
     *
     * @throws BusinessException se a disciplina possuir turmas
     */
    @Transactional
    public void deletar(Long id) {
        Disciplina disciplina = buscarPorId(id);

        if (!turmaRepository.findTurmaByDisciplina(id).isEmpty()) {
            throw new BusinessException("Disciplina possui turmas vinculadas e não pode ser removida.");
        }

        disciplinaRepository.delete(disciplina);
        log.info("Disciplina removida: id={}", id);
    }

    /**
     * Ativa uma disciplina (RF-03). Só é permitido se a disciplina tiver um
     * professor responsável, derivado das turmas: ao menos uma turma com
     * professor atribuído.
     *
     * @throws ResourceNotFoundException se a disciplina não existir
     * @throws BusinessException         se nenhuma turma da disciplina tiver professor
     */
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
        return disciplina; // dirty checking
    }

    /** Desativa uma disciplina. */
    @Transactional
    public Disciplina desativar(Long id) {
        Disciplina disciplina = buscarPorId(id);
        disciplina.setAtivo(false);
        log.info("Disciplina desativada: id={}", id);
        return disciplina; // dirty checking
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

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

    private Departamento resolverDepartamento(Departamento referencia) {
        if (referencia == null || referencia.getId() == null) {
            throw new BusinessException("Departamento é obrigatório.");
        }
        return departamentoRepository.findById(referencia.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Departamento", referencia.getId()));
    }
}
