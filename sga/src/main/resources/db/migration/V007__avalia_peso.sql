-- =====================================================================
-- V007 — Peso da avaliação (RF-05: média ponderada)
-- =====================================================================
-- Coluna nullable: avaliações sem peso definido (NULL) contam como peso 1
-- no cálculo da média ponderada (AvaliacaoService).

ALTER TABLE avalia ADD COLUMN peso NUMERIC(4,2);
