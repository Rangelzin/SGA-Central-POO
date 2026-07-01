-- =====================================================================
-- V005 — Seed (Dados iniciais de demonstração para a banca)
-- =====================================================================

-- 1. UNIVERSIDADE E DEPARTAMENTOS
INSERT INTO universidade (nome, sigla, numero, cep, obs) 
VALUES ('Universidade Federal de Goiás', 'UFG', 'S/N', '74690-900', 'Campus Samambaia');

INSERT INTO departamento (nome, sigla, universidade_id, numero, cep, obs) 
VALUES ('Instituto de Informática', 'INF', 1, 'S/N', '74690-900', 'Prédio do INF');

-- 2. CURSOS E DISCIPLINAS
INSERT INTO curso (nome, sigla, departamento_id, ch_obrigatoria, ch_optativa, ch_nucleo_livre) 
VALUES ('Ciência da Computação', 'BCC', 1, 2400, 400, 200),
       ('Engenharia de Software', 'ES', 1, 2400, 400, 200);

INSERT INTO disciplina (codigo, tipo, carga_horaria, pre_requisito, departamento_id) 
VALUES ('INF0100', 'OBRIGATORIA', 64, NULL, 1),
       ('INF0200', 'OBRIGATORIA', 64, 'INF0100', 1);

-- 3. PESSOAS (Usando UUIDs fixos para facilitar testes de API depois)
-- Senha padrão: '123456'
-- Hash bcrypt gerado com rounds=10: $2b$10$9SSxtLtbLktCWHf0v3mvtOfPgGreXoK1QFfklWk3h.K3EMoYXhe4C
-- IMPORTANTE: Alterar senhas em produção!

-- 3.1 Admin/Secretaria (UUID: c3d4e5f6-7890-1234-5678-9abcdef01234)
INSERT INTO pessoa (id, nome, email, senha, role, matricula, cpf, data_nascimento) 
VALUES ('c3d4e5f6-7890-1234-5678-9abcdef01234', 'Adm. Secretaria', 'admin@ufg.br', '$2b$10$9SSxtLtbLktCWHf0v3mvtOfPgGreXoK1QFfklWk3h.K3EMoYXhe4C', 'ADMIN', 'ADM001', '999.888.777-66', '1990-01-15');

INSERT INTO admin (id) 
VALUES ('c3d4e5f6-7890-1234-5678-9abcdef01234');

-- 3.2 Professor (UUID: a1b2c3d4-e5f6-7890-1234-56789abcdef0)
INSERT INTO pessoa (id, nome, email, senha, role, matricula, cpf, data_nascimento) 
VALUES ('a1b2c3d4-e5f6-7890-1234-56789abcdef0', 'Prof. Alan Turing', 'alan@ufg.br', '$2b$10$9SSxtLtbLktCWHf0v3mvtOfPgGreXoK1QFfklWk3h.K3EMoYXhe4C', 'PROFESSOR', 'P001', '111.222.333-44', '1912-06-23');

INSERT INTO professor (id, titulacao, departamento_id) 
VALUES ('a1b2c3d4-e5f6-7890-1234-56789abcdef0', 'Doutor em Computação', 1);

-- 3.3 Aluno 1 (UUID: b2c3d4e5-f678-9012-3456-789abcdef012)
INSERT INTO pessoa (id, nome, email, senha, role, matricula, cpf, data_nascimento) 
VALUES ('b2c3d4e5-f678-9012-3456-789abcdef012', 'Ada Lovelace', 'ada@discente.ufg.br', '$2b$10$9SSxtLtbLktCWHf0v3mvtOfPgGreXoK1QFfklWk3h.K3EMoYXhe4C', 'ALUNO', 'A001', '555.666.777-88', '1815-12-10');

INSERT INTO aluno (id, nota, frequencia, departamento_id) 
VALUES ('b2c3d4e5-f678-9012-3456-789abcdef012', 0.0, 0.0, 1);

-- 4. OPERAÇÃO ACADÊMICA

-- 4.1 Turma (UUID: d4e5f678-9012-3456-789a-bcdef0123456)
INSERT INTO turma (id, codigo, horario, localidade, data_in, data_out, disciplina_id, professor_id) 
VALUES ('d4e5f678-9012-3456-789a-bcdef0123456', 'T01-2026', 'SEG 08:00-10:00', 'Lab 101', '2026-08-01', '2026-12-15', 1, 'a1b2c3d4-e5f6-7890-1234-56789abcdef0');

-- 4.2 Matrícula do aluno na turma (UUID: e5f67890-1234-5678-9abc-def012345678)
INSERT INTO matriculado (id, nota, status, frequencia, aluno_id, turma_id) 
VALUES ('e5f67890-1234-5678-9abc-def012345678', NULL, 'ATIVA', 0, 'b2c3d4e5-f678-9012-3456-789abcdef012', 'd4e5f678-9012-3456-789a-bcdef0123456');