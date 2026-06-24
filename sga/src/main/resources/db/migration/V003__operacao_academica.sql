-- =====================================================================
-- V003 — Operação acadêmica (IDs UUID)
-- =====================================================================

CREATE TABLE turma (
    id            UUID PRIMARY KEY,
    codigo        VARCHAR(50) NOT NULL,
    horario       VARCHAR(100),
    localidade    VARCHAR(100),
    data_in       DATE,
    data_out      DATE,
    disciplina_id BIGINT NOT NULL,
    professor_id  UUID   NOT NULL,
    deleted       BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_turma_disciplina
        FOREIGN KEY (disciplina_id) REFERENCES disciplina (id),
    CONSTRAINT fk_turma_professor
        FOREIGN KEY (professor_id) REFERENCES professor (id)
);

CREATE TABLE matriculado (
    id         UUID PRIMARY KEY,
    nota       NUMERIC(4,2),
    status     VARCHAR(50),               -- @Enumerated(STRING)
    frequencia INTEGER,
    aluno_id   UUID NOT NULL,
    turma_id   UUID NOT NULL,
    deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_matriculado_aluno
        FOREIGN KEY (aluno_id) REFERENCES aluno (id),
    CONSTRAINT fk_matriculado_turma
        FOREIGN KEY (turma_id) REFERENCES turma (id),
    CONSTRAINT uq_matriculado_aluno_turma UNIQUE (aluno_id, turma_id)
);

CREATE TABLE arquivo (
    id      UUID PRIMARY KEY,
    nome    VARCHAR(255) NOT NULL,
    caminho VARCHAR(512),
    deleted BOOLEAN NOT NULL DEFAULT FALSE
);
