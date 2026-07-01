-- =====================================================================
-- V009 — Normaliza status antigos de matrícula para enum vigente
-- =====================================================================

UPDATE matriculado
SET status = CASE UPPER(status)
    WHEN 'ENROLLED' THEN 'ATIVA'
    WHEN 'IN_PROGRESS' THEN 'ATIVA'
    WHEN 'APPROVED' THEN 'APROVADO'
    WHEN 'FAILED' THEN 'REPROVADO'
    WHEN 'CANCELLED' THEN 'CANCELADA'
    WHEN 'CANCELED' THEN 'CANCELADA'
    ELSE status
END
WHERE status IS NOT NULL;
