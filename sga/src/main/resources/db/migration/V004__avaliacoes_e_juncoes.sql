-- =====================================================================
-- V004 — Avaliações e junções N:M
-- =====================================================================

CREATE TABLE avalia (
    id             UUID PRIMARY KEY,
    status         VARCHAR(50),
    descricao      VARCHAR(255),
    nota           NUMERIC(4,2),
    tipo           VARCHAR(50),            -- @Enumerated(STRING)
    data_in        DATE,
    data_out       DATE,
    matriculado_id UUID NOT NULL,
    deleted        BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_avalia_matriculado
        FOREIGN KEY (matriculado_id) REFERENCES matriculado (id)
);

-- Junção N:M Curso x Disciplina (@ManyToMany)
CREATE TABLE curso_disciplina (
    curso_id      BIGINT NOT NULL,
    disciplina_id BIGINT NOT NULL,
    PRIMARY KEY (curso_id, disciplina_id),
    CONSTRAINT fk_curso_disciplina_curso
        FOREIGN KEY (curso_id) REFERENCES curso (id),
    CONSTRAINT fk_curso_disciplina_disciplina
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id)
);

-- Junção N:M Avalia x Arquivo (@ManyToMany — Modelo B)
CREATE TABLE avalia_anexo (
    avalia_id  UUID NOT NULL,
    arquivo_id UUID NOT NULL,
    PRIMARY KEY (avalia_id, arquivo_id),
    CONSTRAINT fk_avalia_anexo_avalia
        FOREIGN KEY (avalia_id) REFERENCES avalia (id),
    CONSTRAINT fk_avalia_anexo_arquivo
        FOREIGN KEY (arquivo_id) REFERENCES arquivo (id)
);
