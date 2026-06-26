# ALTA-3 — Services com Regras de Negócio · Status

> Documento de acompanhamento para a equipe. Resume o que foi implementado na
> ALTA-3, as decisões tomadas e como as pendências de modelagem foram resolvidas.
>
> **Atualizado em:** 26 de junho de 2026

---

## ✅ Services implementados (7 de 8)

Todos em `com.sga.service`, com teste unitário (Mockito) em `src/test/java/com/sga/service`.

| Service | RF | Resumo | Testes |
|---|---|---|---|
| `AlunoService` | RF-01 | CRUD; e-mail/CPF únicos; senha BCrypt; role ALUNO; delete cascateia matrículas | `AlunoServiceTest` (4) |
| `ProfessorService` | RF-02 | CRUD; exige titulação; delete bloqueado se houver turmas | `ProfessorServiceTest` (6) |
| `DisciplinaService` | RF-03 | CRUD; código único; carga horária > 0; **ativar/desativar**; delete bloqueado se houver turmas | `DisciplinaServiceTest` (9) |
| `TurmaService` | RF-04 | CRUD; código único; **capacidade**; resolve disciplina/professor; lista alunos; delete bloqueado se houver matriculados | `TurmaServiceTest` (7) |
| `MatriculaService` | RF-04 | Matricular (bloqueia duplicidade, **valida vagas**), cancelar, consultas | `MatriculaServiceTest` (7) |
| `AvaliacaoService` | RF-05 | Registrar nota/frequência; **média ponderada**; situação (APROVADO se média ≥ 6 **e** freq ≥ 75%) | `AvaliacaoServiceTest` (10) |
| `RelatorioService` | RF-06/07 | Histórico do aluno; relatório de turma; resumo de aprovação | `RelatorioServiceTest` (4) |

**~47 testes de service.** *(Não validados localmente — ver seção "Compilação/testes".)*

**Padrão adotado:** `@Service` + `@RequiredArgsConstructor` + `@Slf4j`; validações em helpers privados que lançam exceções de negócio; `@Transactional` nas escritas, `readOnly` nas leituras.

**Base de exceções criada** (`com.sga.exception`): `SgaException` (base abstrata) → `ResourceNotFoundException` (404), `BusinessException` (400/422), `ConflictException` (409). O mapeamento para HTTP fica no `@ControllerAdvice` da ALTA-4.

---

## ✅ Pendências de modelagem — RESOLVIDAS

As três dependiam de campos que não existiam no modelo. Foram resolvidas com
colunas **aditivas** (migrations novas, não alteram o que já existe) e a lógica
nos services.

### P1 · Validação de vagas (RF-04)

- **Modelo:** novo campo `capacidade` (Integer, nullable) em `Turma` · migration `V006__turma_capacidade.sql`.
- **Service:** `MatriculaService.matricular` agora barra turma lotada — conta apenas matrículas `ATIVA`; `capacidade = NULL` é tratada como **sem limite**. `TurmaService` seta/valida a capacidade (se informada, > 0).

### P2 · Média ponderada (RF-05)

- **Modelo:** novo campo `peso` (NUMERIC(4,2), nullable) em `Avalia` · migration `V007__avalia_peso.sql`.
- **Service:** `AvaliacaoService.recalcularMedia` agora calcula `Σ(nota·peso) / Σ(peso)`. Avaliações com `peso = NULL` contam como peso 1 (equivale à média simples). `registrarNota` recebe `peso` e valida (> 0). **Atenção:** assinatura mudou para `registrarNota(matriculadoId, nota, peso, tipo, descricao)`.

### P3 · Ativação de disciplina (RF-03)

- **Modelo:** novo campo `ativo` (boolean, default `false`) em `Disciplina` · migration `V008__disciplina_ativo.sql`. **Sem** FK de "professor responsável**".**
- **Service:** `DisciplinaService.ativar(id)` exige professor responsável **derivado das turmas** — a disciplina é ativável se possuir ao menos uma turma com professor atribuído (decisão da equipe: evita uma FK redundante, já que professor se liga via `Turma`). Há também `desativar(id)`. Disciplinas nascem inativas.

---

## ⏭️ Decisão: PessoaService — PULADO

As três responsabilidades que o backlog atribui ao `PessoaService` já existem:

- **Autenticação** → `AuthService` (`login`, `me`).
- **CRUD de pessoas** → já dividido por papel em `AlunoService` e `ProfessorService`.
- **Role validation** → `RoleScopeMapper` + Spring Security (`@EnableMethodSecurity`).

`Pessoa` é classe abstrata (herança JOINED): não se instancia "Pessoa" solta — sempre Aluno/Professor/Admin. Um CRUD genérico de Pessoa duplicaria os services por papel. **Decisão: não criar.** Se futuramente houver necessidade de leitura administrativa transversal (listar/buscar qualquer pessoa), criar um `PessoaService` **somente de leitura**.

---

## 🗄️ Migrations adicionadas

| Migration | Mudança | Pendência |
|---|---|---|
| `V006__turma_capacidade.sql` | `turma` + coluna `capacidade INTEGER` (nullable) | P1 |
| `V007__avalia_peso.sql` | `avalia` + coluna `peso NUMERIC(4,2)` (nullable) | P2 |
| `V008__disciplina_ativo.sql` | `disciplina` + coluna `ativo BOOLEAN NOT NULL DEFAULT FALSE` | P3 |

Todas **aditivas** (apenas `ADD COLUMN`) — não impactam V001–V005 já aplicadas.

---

## 🐞 Bugs corrigidos durante a ALTA-3

Repositories declaravam o tipo de ID errado (quebraria `findById`):

- `DepartamentoRepository`: `JpaRepository<Departamento, UUID>` → **`Long`** (id é `Long`).
- `DisciplinaRepository`: `JpaRepository<Disciplina, UUID>` → **`Long`** (id é `Long`).

---

## 🔧 Arquivos de outros membros alterados (atenção no merge)

Refatoração de tipagem nos repositories de pessoa (herdavam de `PessoaRepository`, tipando `Pessoa`, o que fazia `findAll()` trazer todos os tipos):

- `AlunoRepository` → `JpaRepository<Aluno, UUID>` · `AlunoRepositoryTest` ajustado (`Optional<Pessoa>` → `Optional<Aluno>`).
- `ProfessorRepository` → `JpaRepository<Professor, UUID>` · `ProfessorRepositoryTest` ajustado (idem).

Entidades com coluna nova (P1/P2/P3): `Turma`, `Avalia`, `Disciplina`.

---

## 🧩 Organização dos commits

O trabalho foi separado por tipo, conforme combinado (mudanças fora de service
em commits próprios):

1. **não-service** — bugfixes de repositories + refactor `AlunoRepository`/`ProfessorRepository` (+ testes de repo).
2. **não-service** — entidades (`Turma`/`Avalia`/`Disciplina`) + migrations `V006`/`V007`/`V008`.
3. **service** — exceções + 7 services + testes de service.
4. **docs** — este arquivo + `task.md`.

---

## 📌 Compilação/testes (não validados localmente)

> O build exige **JDK 21**; a máquina Windows só tem JDK 15. Compilar/testar pelo **WSL (Ubuntu, JDK 21)** — ver `docs/` para o roteiro de teste, quando gerado.

- **Mockito:** o build usa starters granulares (`spring-boot-starter-*-test`). Se a compilação dos testes falhar em `org.mockito.junit.jupiter.MockitoExtension`, adicionar em `build.gradle`:
  `testImplementation 'org.mockito:mockito-junit-jupiter'`
- **Schema ↔ entidades:** com `ddl-auto=none` + Flyway, conferir que `V006`/`V007`/`V008` casam com os novos campos rodando a app contra um banco limpo.
