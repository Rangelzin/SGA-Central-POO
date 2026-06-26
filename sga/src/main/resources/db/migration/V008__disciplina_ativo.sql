-- =====================================================================
-- V008 — Estado de ativação da disciplina (RF-03)
-- =====================================================================
-- Disciplinas iniciam inativas. A ativação (DisciplinaService.ativar) exige
-- que a disciplina tenha ao menos uma turma com professor responsável.

ALTER TABLE disciplina ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT FALSE;
