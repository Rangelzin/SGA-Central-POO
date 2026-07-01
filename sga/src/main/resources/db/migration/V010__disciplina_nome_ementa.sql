-- =====================================================================
-- V010 — Adiciona nome e ementa em disciplina
-- =====================================================================

ALTER TABLE disciplina
    ADD COLUMN IF NOT EXISTS nome VARCHAR(255);

UPDATE disciplina
SET nome = codigo
WHERE nome IS NULL OR TRIM(nome) = '';

ALTER TABLE disciplina
    ALTER COLUMN nome SET NOT NULL;

ALTER TABLE disciplina
    ADD COLUMN IF NOT EXISTS ementa TEXT;

UPDATE disciplina
SET ementa = COALESCE(ementa, '');
