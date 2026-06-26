-- =====================================================================
-- V006 — Capacidade de turma (RF-04: validação de vagas)
-- =====================================================================
-- Coluna nullable: turmas sem capacidade definida (NULL) são tratadas
-- como "sem limite" pela aplicação (MatriculaService).

ALTER TABLE turma ADD COLUMN capacidade INTEGER;
