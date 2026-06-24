-- =====================================================================
-- V002 — Pessoas (herança JOINED, IDs UUID)
-- aluno/professor/admin têm id que é PK E FK -> pessoa(id).
-- @SoftDelete está na raiz Pessoa: a coluna `deleted` fica só em pessoa.
-- =====================================================================

CREATE TABLE pessoa (
    id              UUID PRIMARY KEY,
    nome            VARCHAR(120) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    senha           VARCHAR(255) NOT NULL,
    role            VARCHAR(50)  NOT NULL,   -- @Enumerated(STRING)
    matricula       VARCHAR(20)  UNIQUE,
    cpf             VARCHAR(14)  NOT NULL UNIQUE,
    data_nascimento DATE,
    deleted         BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE aluno (
    id              UUID PRIMARY KEY,
    nota            NUMERIC(4,2),
    frequencia      NUMERIC(5,2),
    departamento_id BIGINT NOT NULL,
    CONSTRAINT fk_aluno_pessoa
        FOREIGN KEY (id) REFERENCES pessoa (id),
    CONSTRAINT fk_aluno_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento (id)
);

CREATE TABLE professor (
    id              UUID PRIMARY KEY,
    titulacao       VARCHAR(100),
    departamento_id BIGINT NOT NULL,
    CONSTRAINT fk_professor_pessoa
        FOREIGN KEY (id) REFERENCES pessoa (id),
    CONSTRAINT fk_professor_departamento
        FOREIGN KEY (departamento_id) REFERENCES departamento (id)
);

CREATE TABLE admin (
    id UUID PRIMARY KEY,
    CONSTRAINT fk_admin_pessoa
        FOREIGN KEY (id) REFERENCES pessoa (id)
);
