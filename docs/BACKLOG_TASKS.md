# 🎯 Backlog de Tasks - SGA-Central-POO

**Gerado em:** 18 de junho de 2026  
**Total de Tasks:** 111

---

## 📊 Resumo por Prioridade

| Prioridade | Quantidade | 
|-----------|-----------|
| 🔴 ALTA | 7 | 
| 🟠 MÉDIA | 4 |  
| **TOTAL** | **11** | 

## 🌳 Branchs para serem usadas:

- **Rangel**: `feat/rangel`
- **Bruno**: `feat/bruno`
- **Tiago**: `feat/tiago`
- **Walisson**: `feat/walisso`

---

# 🔴 TAREFAS CRÍTICAS (ALTA PRIORIDADE)

## ALTA-1: Implementar Entidades Models

**ID:** ALTA-1  
**Título:** Implementar todas as 13 Entidades Models
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `backend`, `jpa`, `entities`, `critical`

**Descrição:**
Implementar todas as classes de entidade conforme diagrama de classes PlantUML:
- Pessoa (abstract) com @MappedSuperclass
- Aluno, Professor, Admin (extends Pessoa)
- Disciplina, Turma, Matriculado, Avalia
- Curso, CargaHoraria, Departamento, Universidade, Endereco

**Checklist:**
- [ ] Implementar classe abstrata Pessoa com @MappedSuperclass
- [ ] Implementar Aluno extends Pessoa com @Entity
- [ ] Implementar Professor extends Pessoa com @Entity
- [ ] Implementar Admin extends Pessoa com @Entity
- [ ] Implementar Disciplina com @Entity
- [ ] Implementar Turma com @Entity
- [ ] Implementar Matriculado (tabela de junção) com @Entity
- [ ] Implementar Avalia com @Entity
- [ ] Implementar Curso com @Entity
- [ ] Implementar CargaHoraria como @Embeddable
- [ ] Implementar Departamento com @Entity
- [ ] Implementar Universidade com @Entity
- [ ] Implementar Endereco como @Embeddable
- [ ] Mapear relacionamentos 1:N, N:M, 1:1
- [ ] Adicionar anotações de validação (@NotNull, @NotBlank, @Size)
- [ ] Adicionar construtores, getters, setters
- [ ] Compilar sem erros

**Critérios Atendidos:**
- ✅ (a) Implementação das classes conforme o modelo
- ✅ (d) Uso de Classe Abstrata e/ou Interface
- ✅ (i) Uso de ArrayList ou coleções (List em relacionamentos N)

**Bloqueador Para:**
- ALTA-2, ALTA-3, ALTA-4, ALTA-5, ALTA-6

**Notas:**
- Usar UUID como ID (@GeneratedValue strategy = UUID)
- Respeitar diagrama em docs/Diagrama-de-classes.puml
- Adicionar @Table(name = "...") com nomes em snake_case
- Usar Lombok (@Getter, @Setter, @NoArgsConstructor) para reduzir boilerplate

---

## ALTA-2: Implementar Repositories JPA

**ID:** ALTA-2  
**Título:** Implementar todas as Interfaces Repository JPA
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `backend`, `jpa`, `repository`, `critical`  
**Depends On:** ALTA-1

**Descrição:**
Criar interfaces Repository para persistência de dados (JPA).

**Repositories a Implementar:**
```
com.sga.repository
├── PessoaRepository (genérico)
├── AlunoRepository
├── ProfessorRepository
├── DisciplinaRepository
├── TurmaRepository
├── MatriculadoRepository
├── AvaliaRepository
├── CursoRepository
├── DepartamentoRepository
└── UniversidadeRepository
```

**Checklist:**
- [ ] Criar interface PessoaRepository<T extends Pessoa> extends JpaRepository<T, UUID>
- [ ] Criar AlunoRepository extends JpaRepository<Aluno, UUID>
- [ ] Criar ProfessorRepository extends JpaRepository<Professor, UUID>
- [ ] Criar DisciplinaRepository extends JpaRepository<Disciplina, UUID>
- [ ] Criar TurmaRepository extends JpaRepository<Turma, UUID>
- [ ] Criar MatriculadoRepository extends JpaRepository<Matriculado, UUID>
- [ ] Criar AvaliaRepository extends JpaRepository<Avalia, UUID>
- [ ] Criar CursoRepository extends JpaRepository<Curso, UUID>
- [ ] Criar DepartamentoRepository extends JpaRepository<Departamento, UUID>
- [ ] Criar UniversidadeRepository extends JpaRepository<Universidade, UUID>
- [ ] Adicionar @Query customizadas onde necessário
- [ ] Query: findByEmail(String email) em Pessoa
- [ ] Query: findByCpf(String cpf) em Pessoa
- [ ] Query: findTurmasByDisciplina(UUID disciplinaId) em TurmaRepository
- [ ] Query: findMatriculadosByAluno(UUID alunoId) em MatriculadoRepository
- [ ] Query: findMatriculadosByTurma(UUID turmaId) em MatriculadoRepository
- [ ] Adicionar testes @DataJpaTest para cada repository
- [ ] Compilar sem erros

**Critérios Atendidos:**
- ✅ (c) Persistência em arquivos ou banco

**Bloqueador Para:**
- ALTA-3, ALTA-4, ALTA-5, ALTA-6

**Notas:**
- Usar `extends JpaRepository<Entity, UUID>`
- @Query(value = "...", nativeQuery = true) para queries complexas
- @Query("SELECT ...") para JPQL
- Adicionar método `existsByEmail(String email)` para validações

---

## ALTA-3: Implementar Services (Camada de Aplicação)

**ID:** ALTA-3  
**Título:** Implementar Services com Regras de Negócio  
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `backend`, `service`, `business-logic`, `critical`  
**Depends On:** ALTA-2

**Descrição:**
Implementar serviços com regras de negócio (RF-01 a RF-07).

**Services a Implementar:**
```
com.sga.service
├── PessoaService
├── AlunoService
├── ProfessorService
├── DisciplinaService
├── TurmaService
├── MatriculaService
├── AvaliacaoService
└── RelatorioService
```

**Checklist:**
- [ ] PessoaService: CRUD base, autenticação, role validation
- [ ] AlunoService: criar, listar, editar, deletar aluno
- [ ] ProfessorService: CRUD professor
- [ ] DisciplinaService: CRUD + validação (não ativar sem professor responsável - RF-03)
- [ ] TurmaService: CRUD + gestão de vagas (RF-04)
- [ ] MatriculaService: criar matrícula, cancelar, validar duplicidade (RF-04), validar vagas
- [ ] AvaliacaoService: registrar nota, registrar frequência, calcular aprovação (RF-05)
- [ ] RelatorioService: gerar histórico acadêmico (RF-06), gerar relatório de turma (RF-07)
- [ ] Implementar @Transactional em operações críticas
- [ ] Implementar exception handling com SgaException
- [ ] Adicionar validações de regra de negócio
- [ ] Adicionar logging (SLF4J)
- [ ] Criar testes unitários com Mockito (cobertura ≥ 70%)
- [ ] Compilar sem erros

**Regras de Negócio (RFs) a Implementar:**

**RF-01: Gerenciar Alunos**
```
- Criar aluno: validar email único, CPF válido
- Listar alunos: suportar paginação e filtros
- Editar aluno: validar novos dados
- Deletar aluno: cascade delete de matrículas
```

**RF-02: Gerenciar Professores**
```
- CRUD professor
- Validar email único
- Atribuir departamento
```

**RF-03: Gerenciar Disciplinas**
```
- CRUD disciplina
- Não permitir ativar sem professor responsável
- Validar código único
```

**RF-04: Matrícula em Disciplinas**
```
- Criar matrícula: aluno + turma
- Validar duplicidade (aluno não pode se matricular 2x na mesma turma)
- Validar vagas disponíveis
- Status: ENROLLED → IN_PROGRESS → APPROVED/FAILED
```

**RF-05: Registrar Notas e Frequência**
```
- Registrar nota para matriculado
- Registrar frequência para matriculado
- Calcular situação: APROVADO se média ≥ 6.0 E frequência ≥ 75%
- Calcular média ponderada das avaliações
```

**RF-06: Consultar Histórico Acadêmico**
```
- Retornar todas as matrículas do aluno
- Incluir notas, frequência, status
```

**RF-07: Gerar Relatórios**
```
- Relatório de turma: lista de alunos com notas e frequência
- Relatório de aprovação
```

**Critérios Atendidos:**
- ✅ (a) Implementação das classes conforme o modelo
- ✅ (d) Abstração e separação de responsabilidades
- ✅ (e) CRUD completo
- ✅ (h) Tratamento de exceções

**Bloqueador Para:**
- ALTA-4, ALTA-6

---

## ALTA-4: Implementar Controllers REST

**ID:** ALTA-4  
**Título:** Implementar Controllers REST para Todos os Recursos  
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `backend`, `rest-api`, `controller`, `critical`  
**Depends On:** ALTA-3

**Descrição:**
Implementar endpoints REST para CRUD completo.

**Controllers a Implementar:**
```
com.sga.controller
├── AlunoController
├── ProfessorController
├── DisciplinaController
├── TurmaController
├── MatriculaController
├── AvaliacaoController
├── RelatorioController
└── AuthController
```

**Endpoints a Implementar:**

### AlunoController
```
GET    /api/alunos                 - Listar alunos (com paginação)
POST   /api/alunos                 - Criar aluno
GET    /api/alunos/{id}            - Detalhe de aluno
PUT    /api/alunos/{id}            - Editar aluno
DELETE /api/alunos/{id}            - Deletar aluno
```

### ProfessorController
```
GET    /api/professores            - Listar professores
POST   /api/professores            - Criar professor
GET    /api/professores/{id}       - Detalhe de professor
PUT    /api/professores/{id}       - Editar professor
DELETE /api/professores/{id}       - Deletar professor
GET    /api/professores/{id}/turmas - Turmas do professor
```

### DisciplinaController
```
GET    /api/disciplinas            - Listar disciplinas
POST   /api/disciplinas            - Criar disciplina
GET    /api/disciplinas/{id}       - Detalhe de disciplina
PUT    /api/disciplinas/{id}       - Editar disciplina
DELETE /api/disciplinas/{id}       - Deletar disciplina
PUT    /api/disciplinas/{id}/ativar - Ativar disciplina
GET    /api/disciplinas/{id}/turmas - Turmas da disciplina
```

### TurmaController
```
GET    /api/turmas                 - Listar turmas
POST   /api/turmas                 - Criar turma
GET    /api/turmas/{id}            - Detalhe de turma
PUT    /api/turmas/{id}            - Editar turma
DELETE /api/turmas/{id}            - Deletar turma
GET    /api/turmas/{id}/alunos     - Alunos da turma
GET    /api/turmas/{id}/vagas      - Vagas disponíveis
```

### MatriculaController
```
POST   /api/matriculas             - Matricular aluno em turma
DELETE /api/matriculas/{id}        - Cancelar matrícula
GET    /api/matriculas/meus        - Minhas matrículas (aluno autenticado)
GET    /api/matriculas/{id}        - Detalhe de matrícula
```

### AvaliacaoController
```
POST   /api/avaliacoes/nota        - Registrar nota
POST   /api/avaliacoes/frequencia  - Registrar frequência
GET    /api/avaliacoes/{id}        - Detalhe de avaliação
```

### RelatorioController
```
GET    /api/relatorios/historico   - Histórico acadêmico (aluno)
GET    /api/relatorios/turma/{id}  - Relatório de turma
GET    /api/relatorios/turma/{id}/pdf - PDF do relatório
```

### AuthController
```
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh           - Refresh token
GET    /api/auth/me                - Dados do usuário autenticado
```

**Checklist:**
- [ ] Criar AlunoController com endpoints CRUD
- [ ] Criar ProfessorController com endpoints CRUD
- [ ] Criar DisciplinaController com endpoints CRUD + ativar
- [ ] Criar TurmaController com endpoints CRUD
- [ ] Criar MatriculaController com validações (duplicidade, vagas)
- [ ] Criar AvaliacaoController (registrar nota e frequência)
- [ ] Criar RelatorioController
- [ ] Criar AuthController (login, logout, refresh, me)
- [ ] Implementar DTOs para request/response
- [ ] Validação de entrada com @Valid e Bean Validation
- [ ] HTTP status corretos (201 CREATE, 204 NO_CONTENT, 404 NOT_FOUND, 409 CONFLICT)
- [ ] @ControllerAdvice para error handling global
- [ ] @PreAuthorize para autorização por role
- [ ] Testes de integração (SpringBootTest)
- [ ] Compilar sem erros

**Critérios Atendidos:**
- ✅ (e) CRUD completo
- ✅ (h) Tratamento de exceções

**Bloqueador Para:**
- ALTA-6

---

## ALTA-5: Migrations SQL (Flyway)

**ID:** ALTA-5  
**Título:** Implementar Migrations SQL (Flyway)  
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `backend`, `database`, `migrations`, `critical`  
**Depends On:** ALTA-1

**Descrição:**
Criar scripts SQL de migration aderentes ao modelo relacional definido no diagrama oficial do projeto (PDF). O schema deve refletir exatamente as tabelas, atributos, relacionamentos e enums presentes na modelagem.

**Fonte de Verdade:**
- Modelo relacional do PDF fornecido pela equipe.
- Não adicionar colunas, tabelas ou relacionamentos não presentes no modelo.
- Não adicionar auditoria (`created_at`, `updated_at`).
- Não adicionar autenticação, JWT ou requisitos futuros.
- Não utilizar UUID em entidades cujo modelo define `BIGINT`.

---

## Migrations a Implementar

### V001__create_enums.sql

```sql
CREATE TYPE role AS ENUM (
    'ALUNO',
    'PROFESSOR',
    'ADMIN'
);

CREATE TYPE matricula_status AS ENUM (
    'ATIVA',
    'TRANCADA',
    'CANCELADA',
    'APROVADO',
    'REPROVADO'
);

CREATE TYPE avalia_tipo AS ENUM (
    'PROVA',
    'TRABALHO',
    'SEMINARIO',
    'LISTA',
    'OUTRO'
);
```

---

### V002__create_core_tables.sql

```sql
CREATE TABLE endereco (
    id BIGINT PRIMARY KEY,
    numero VARCHAR(20),
    cep VARCHAR(9),
    obs VARCHAR(255)
);

CREATE TABLE universidade (
    id BIGINT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    sigla VARCHAR(20) NOT NULL,
    endereco_id BIGINT NOT NULL,
    CONSTRAINT fk_universidade_endereco
        FOREIGN KEY (endereco_id)
        REFERENCES endereco(id)
);

CREATE TABLE departamento (
    id BIGINT PRIMARY KEY,
    sigla VARCHAR(20) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    universidade_id BIGINT NOT NULL,
    endereco_id BIGINT NOT NULL,
    CONSTRAINT fk_departamento_universidade
        FOREIGN KEY (universidade_id)
        REFERENCES universidade(id),
    CONSTRAINT fk_departamento_endereco
        FOREIGN KEY (endereco_id)
        REFERENCES endereco(id)
);

CREATE TABLE carga_horaria (
    id BIGINT PRIMARY KEY,
    ch_obrigatoria INTEGER NOT NULL,
    ch_optativa INTEGER NOT NULL,
    ch_nucleo_livre INTEGER NOT NULL
);

CREATE TABLE curso (
    id BIGINT PRIMARY KEY,
    sigla VARCHAR(20) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    departamento_id BIGINT NOT NULL,
    carga_horaria_id BIGINT NOT NULL,
    CONSTRAINT fk_curso_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id),
    CONSTRAINT fk_curso_carga_horaria
        FOREIGN KEY (carga_horaria_id)
        REFERENCES carga_horaria(id)
);
```

---

### V003__create_people_tables.sql

```sql
CREATE TABLE pessoa (
    id UUID PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role role NOT NULL,
    matricula VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    data_nascimento DATE
);

CREATE TABLE aluno (
    id UUID PRIMARY KEY,
    departamento_id BIGINT NOT NULL,
    nota DECIMAL(4,2),
    frequencia DECIMAL(5,2),
    CONSTRAINT fk_aluno_pessoa
        FOREIGN KEY (id)
        REFERENCES pessoa(id),
    CONSTRAINT fk_aluno_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id)
);

CREATE TABLE professor (
    id UUID PRIMARY KEY,
    titulacao VARCHAR(60),
    departamento_id BIGINT NOT NULL,
    CONSTRAINT fk_professor_pessoa
        FOREIGN KEY (id)
        REFERENCES pessoa(id),
    CONSTRAINT fk_professor_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id)
);

CREATE UNIQUE INDEX idx_pessoa_email
    ON pessoa(email);

CREATE UNIQUE INDEX idx_pessoa_cpf
    ON pessoa(cpf);

CREATE UNIQUE INDEX idx_pessoa_matricula
    ON pessoa(matricula);
```

---

### V004__create_academic_tables.sql

```sql
CREATE TABLE disciplina (
    id BIGINT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    tipo VARCHAR(40),
    carga_horaria INTEGER,
    pre_requisito VARCHAR(20),
    departamento_id BIGINT NOT NULL,
    CONSTRAINT fk_disciplina_departamento
        FOREIGN KEY (departamento_id)
        REFERENCES departamento(id)
);

CREATE TABLE curso_disciplina (
    curso_id BIGINT NOT NULL,
    disciplina_id BIGINT NOT NULL,

    PRIMARY KEY (
        curso_id,
        disciplina_id
    ),

    CONSTRAINT fk_curso_disciplina_curso
        FOREIGN KEY (curso_id)
        REFERENCES curso(id),

    CONSTRAINT fk_curso_disciplina_disciplina
        FOREIGN KEY (disciplina_id)
        REFERENCES disciplina(id)
);

CREATE TABLE turma (
    id UUID PRIMARY KEY,
    codigo VARCHAR(30),
    horario VARCHAR(60),
    localidade VARCHAR(120),
    data_in DATE,
    data_out DATE,
    disciplina_id BIGINT NOT NULL,
    professor_id UUID NOT NULL,

    CONSTRAINT fk_turma_disciplina
        FOREIGN KEY (disciplina_id)
        REFERENCES disciplina(id),

    CONSTRAINT fk_turma_professor
        FOREIGN KEY (professor_id)
        REFERENCES professor(id)
);

CREATE TABLE matriculado (
    id UUID PRIMARY KEY,
    aluno_id UUID NOT NULL,
    turma_id UUID NOT NULL,
    nota DECIMAL(4,2),
    frequencia INTEGER,
    status matricula_status,

    CONSTRAINT fk_matriculado_aluno
        FOREIGN KEY (aluno_id)
        REFERENCES aluno(id),

    CONSTRAINT fk_matriculado_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id)
);

CREATE INDEX idx_turma_disciplina
    ON turma(disciplina_id);

CREATE INDEX idx_turma_professor
    ON turma(professor_id);

CREATE INDEX idx_matriculado_aluno
    ON matriculado(aluno_id);

CREATE INDEX idx_matriculado_turma
    ON matriculado(turma_id);
```

---

### V005__create_assessment_tables.sql

```sql
CREATE TABLE avalia (
    id UUID PRIMARY KEY,
    matriculado_id UUID NOT NULL,
    tipo avalia_tipo NOT NULL,
    descricao VARCHAR(255),
    nota DECIMAL(4,2),
    status VARCHAR(40),
    data_in DATE,
    data_out DATE,

    CONSTRAINT fk_avalia_matriculado
        FOREIGN KEY (matriculado_id)
        REFERENCES matriculado(id)
);

CREATE TABLE avalia_arquivo (
    id BIGINT PRIMARY KEY,
    avalia_id UUID NOT NULL,
    caminho VARCHAR(500),

    CONSTRAINT fk_avalia_arquivo_avalia
        FOREIGN KEY (avalia_id)
        REFERENCES avalia(id)
);

CREATE INDEX idx_avalia_matriculado
    ON avalia(matriculado_id);

CREATE INDEX idx_avalia_arquivo_avalia
    ON avalia_arquivo(avalia_id);
```

---

### V006__seed_data.sql

```sql
-- Seed opcional para demonstração em banca.

INSERT INTO endereco (
    id,
    numero,
    cep,
    obs
)
VALUES (
    1,
    '100',
    '74000-000',
    'Campus Principal'
);

INSERT INTO universidade (
    id,
    nome,
    sigla,
    endereco_id
)
VALUES (
    1,
    'Universidade Federal',
    'UFG',
    1
);

INSERT INTO departamento (
    id,
    sigla,
    nome,
    universidade_id,
    endereco_id
)
VALUES (
    1,
    'INF',
    'Instituto de Informatica',
    1,
    1
);

INSERT INTO carga_horaria (
    id,
    ch_obrigatoria,
    ch_optativa,
    ch_nucleo_livre
)
VALUES (
    1,
    2400,
    300,
    200
);

INSERT INTO curso (
    id,
    sigla,
    nome,
    departamento_id,
    carga_horaria_id
)
VALUES (
    1,
    'BCC',
    'Bacharelado em Ciencia da Computacao',
    1,
    1
);
```

---

### Checklist

- [ ] Criar arquivo `V001__create_enums.sql`
- [ ] Criar arquivo `V002__create_core_tables.sql`
- [ ] Criar arquivo `V003__create_people_tables.sql`
- [ ] Criar arquivo `V004__create_academic_tables.sql`
- [ ] Criar arquivo `V005__create_assessment_tables.sql`
- [ ] Criar arquivo `V006__seed_data.sql`
- [ ] Salvar em `src/main/resources/db/migration/`
- [ ] Validar execução completa do Flyway
- [ ] Executar migrations em banco limpo
- [ ] Verificar todas as Foreign Keys
- [ ] Verificar tipos UUID e BIGINT conforme modelo
- [ ] Verificar enums PostgreSQL
- [ ] Validar índices criados
- [ ] Documentar schema no README
- [ ] Garantir aderência total ao modelo do PDF

### Critérios Atendidos

- ✅ (a) Implementação das classes conforme o modelo
- ✅ (c) Persistência em banco de dados
- ✅ (e) Base para CRUD funcional
- ✅ (k) Base para aplicação executável

### Observações Técnicas

- O modelo utiliza UUID apenas para:
  - pessoa
  - aluno
  - professor
  - turma
  - matriculado
  - avalia

- O modelo utiliza BIGINT para:
  - universidade
  - departamento
  - endereco
  - curso
  - carga_horaria
  - disciplina
  - avalia_arquivo

- A tabela `curso_disciplina` é a única relação N:N do modelo.

- A herança Pessoa → Aluno/Professor deve ser implementada via chave primária compartilhada (`PK = FK`).

- Esta migration deve permanecer aderente ao PDF mesmo que futuras regras de negócio adicionem novos atributos.

---

## ALTA-6: Integração Backend-Frontend

**ID:** ALTA-6  
**Título:** Integrar Frontend Real com Backend  
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `frontend`, `backend`, `integration`, `critical`  
**Depends On:** ALTA-4

**Descrição:**
Remover MSW (Mock Service Worker) do frontend e conectar ao backend real.

**Checklist:**
- [ ] Atualizar `src/lib/api/client.ts` para apontar a backend real
- [ ] Desabilitar MSW em produção
- [ ] Adaptar tipos de response (DTO ↔ frontend types)
- [ ] Implementar tratamento de erros (mapear exceções Java)
- [ ] Implementar autenticação com JWT
  - [ ] Login salva token no localStorage
  - [ ] Logout remove token
  - [ ] Refresh token implementado
  - [ ] Token injetado em Authorization header
- [ ] Implementar @CrossOrigin no backend
- [ ] Testar endpoints críticos
- [ ] Documentar API endpoints
- [ ] Compilar e testar sem erros

**Endpoints Críticos a Testar:**
- [ ] POST /api/auth/login → token salvo
- [ ] GET /api/alunos → lista renderizada
- [ ] POST /api/alunos → novo aluno criado
- [ ] PUT /api/alunos/{id} → aluno editado
- [ ] DELETE /api/alunos/{id} → aluno deletado
- [ ] POST /api/matriculas → matrícula criada
- [ ] GET /api/relatorios/historico → histórico carregado

**Critérios Atendidos:**
- ✅ (e) CRUD completo (funcional end-to-end)

---

## ALTA-7: Javadoc Completo

**ID:** ALTA-7  
**Título:** Adicionar Javadoc em Todas as Classes  
**Prioridade:** 🔴 CRÍTICA  
**Labels:** `backend`, `documentation`, `javadoc`, `critical`

**Descrição:**
Documentar todas as classes Java com Javadoc.

**Checklist:**
- [ ] Javadoc em todas as entidades (classes, campos, métodos)
- [ ] Javadoc em todos os services (métodos públicos)
- [ ] Javadoc em todos os controllers (endpoints com @ApiOperation)
- [ ] Javadoc em todos os repositories
- [ ] Adicionar @author, @version, @since
- [ ] Adicionar exemplos de uso onde relevante
- [ ] Swagger/OpenAPI (@ApiModel, @ApiModelProperty, @ApiOperation)
- [ ] Adicionar dependência springdoc-openapi-ui
- [ ] Endpoint /swagger-ui.html acessível
- [ ] Atualizar README.md com seção de API
- [ ] Gerar javadoc (./gradlew javadoc)
- [ ] Validar sem warnings
- [ ] Compilar sem erros

**Exemplo de Javadoc:**
```java
/**
 * Classe que representa um Aluno no sistema SGA.
 * <p>
 * Um aluno é uma pessoa que pode se matricular em disciplinas
 * e receber notas e frequência.
 * </p>
 *
 * @author SGA Team
 * @version 1.0
 * @since 2026-06-18
 */
@Entity
@Table(name = "pessoas")
public class Aluno extends Pessoa {
    
    /**
     * Referência ao curso do aluno.
     */
    private Course course;
    
    /**
     * Realiza uma matrícula do aluno em uma turma.
     *
     * @param turma a turma em que o aluno deseja se matricular
     * @return um objeto Matriculado representando a inscrição
     * @throws MatriculaDuplicadaException se o aluno já está matriculado
     * @throws VagaIndisponivelException se não há vagas disponíveis
     */
    public Matriculado realizarMatricula(Turma turma) {
        // implementação
    }
}
```

**Critérios Atendidos:**
- ✅ (j) Javadoc

---

# 🟠 TAREFAS IMPORTANTES (MÉDIA PRIORIDADE)

## MÉDIA-1: Testes Unitários do Backend

**ID:** MÉDIA-1  
**Título:** Implementar Testes Unitários com Cobertura ≥ 50%  
**Prioridade:** 🟠 MÉDIA  
**Labels:** `backend`, `testing`, `unit-tests`  
**Depends On:** ALTA-3, ALTA-4

**Descrição:**
Implementar testes unitários para services e repositories.

**Checklist:**
- [ ] Testes @DataJpaTest para cada repository
- [ ] Testes de service com Mockito
- [ ] Testes de validação de regras de negócio
  - [ ] RF-03: Não ativar disciplina sem professor
  - [ ] RF-04: Não permitir duplicidade de matrícula
  - [ ] RF-04: Validar vagas disponíveis
  - [ ] RF-05: Cálculo de aprovação (média ≥ 6.0 e frequência ≥ 75%)
  - [ ] RF-05: Cálculo de média ponderada
- [ ] Testes de controller 
- [ ] Cobertura mínima 50%
- [ ] Relatório de cobertura (JaCoCo)
- [ ] Compilar sem erros

**Target de Cobertura:**
- Repositories: 80%
- Services: 70%
- Controllers: 60%
- Geral: 50%

**Critérios Atendidos:**
- ✅ (g) Casos de teste

---

## MÉDIA-2: Autenticação e Autorização (Spring Security + JWT)

**ID:** MÉDIA-2  
**Título:** Implementar Spring Security + JWT  
**Prioridade:** 🟠 MÉDIA  
**Labels:** `backend`, `security`, `authentication`, `jwt`

**Descrição:**
Implementar autenticação com JWT e autorização baseada em roles.

**Checklist:**
- [ ] Adicionar dependência spring-security
- [ ] Adicionar dependência jjwt (JWT)
- [ ] Implementar SecurityConfig
- [ ] Implementar JwtTokenProvider
- [ ] Implementar JwtAuthenticationFilter
- [ ] Implementar AuthService
  - [ ] Login com email/senha
  - [ ] Gerar JWT token
  - [ ] Refresh token
  - [ ] Validar token
- [ ] Implementar @PreAuthorize em endpoints
  - [ ] @PreAuthorize("hasRole('ADMIN')") para admin
  - [ ] @PreAuthorize("hasRole('TEACHER')") para professor
  - [ ] @PreAuthorize("hasRole('STUDENT')") para aluno
  - [ ] @PreAuthorize("@customSecurity.isOwner(#id)") para dados pessoais
- [ ] Testar fluxo de login/logout
- [ ] Testar refresh token
- [ ] Testar acesso não autorizado (403)
- [ ] Testar token expirado (401)
- [ ] Compilar sem erros

**Endpoints:**
```
POST   /api/auth/login          - Retorna JWT token
POST   /api/auth/logout         - Invalida token
POST   /api/auth/refresh        - Renova token
GET    /api/auth/me             - Dados do usuário autenticado
```

---

## MÉDIA-3: Validações Customizadas

**ID:** MÉDIA-3  
**Título:** Implementar Validadores Customizados  
**Prioridade:** 🟠 MÉDIA  
**Labels:** `backend`, `validation`  
**Depends On:** ALTA-3

**Descrição:**
Criar validadores customizados para regras de negócio.

**Checklist:**
- [ ] CpfValidator (validar CPF brasileiro)
- [ ] EmailValidator (validar email)
- [ ] DataNascimentoValidator (maior de 18 anos)
- [ ] CodigoUnicoValidator (validar código único de disciplina/turma)
- [ ] Mensagens de erro customizadas em português
- [ ] Testar validadores
- [ ] Compilar sem erros

**Exemplo:**
```java
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CpfValidator.class)
public @interface ValidCpf {
    String message() default "CPF inválido";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

@Entity
public class Aluno extends Pessoa {
    @ValidCpf
    private String cpf;
}
```

---

## MÉDIA-4: Documentação API (Swagger)

**ID:** MÉDIA-4
**Título:** Documentação API com Swagger/OpenAPI  
**Prioridade:** 🟠 MÉDIA  
**Labels:** `documentation`, `swagger`, `openapi`

**Descrição:**
Gerar documentação interativa da API com Swagger.

**Checklist:**
- [ ] Adicionar dependência springdoc-openapi-ui
- [ ] Adicionar @OpenAPIDefinition
- [ ] Adicionar @ApiOperation em controllers
- [ ] Adicionar @ApiResponse com exemplos
- [ ] Adicionar @ApiModel em DTOs
- [ ] Endpoint /swagger-ui.html funcional
- [ ] Exportar OpenAPI YAML/JSON
- [ ] Compilar sem erros

---

# 📊 Matriz de Dependências

```
ALTA-1 (Entidades)
├── ALTA-2 (Repositories)
│   ├── ALTA-3 (Services)
│   │   ├── ALTA-4 (Controllers)
│   │   │   └── ALTA-6 (Integração)
│   │   └── MÉDIA-1 (Testes)
│   └── ALTA-5 (Migrations)
│       └── ALTA-6 (Integração)
├── ALTA-7 (Javadoc)
├── MÉDIA-2 (Autenticação)
├── MÉDIA-3 (Validadores)
└── MÉDIA-4 (Logs)

BAIXA (sem dependências críticas)
```

---

# 📝 Checklist Pré-Apresentação

- [ ] Backend compila sem erros
- [ ] Todas as 13 entidades JPA implementadas
- [ ] Todos os repositories criados
- [ ] Todos os services com lógica de negócio
- [ ] Todos os controllers REST
- [ ] Migrations SQL executadas com sucesso
- [ ] Frontend integrado ao backend 
- [ ] CRUD funcional (criar, listar, editar, deletar)
- [ ] Dados persistem no PostgreSQL
- [ ] Javadoc em 100% das classes públicas
- [ ] Mínimo 50% de cobertura de testes
- [ ] JAR executável gerado (`./gradlew bootJar`)
- [ ] Docker Compose funcionando (`docker-compose up --build`)
- [ ] Teste de login funcional
- [ ] Teste de matrícula funcional
- [ ] Teste de registrar nota funcional
- [ ] Teste de gerar relatório funcional
- [ ] Nenhum TODO/FIXME no código crítico
- [ ] README.md com instruções atualizadas

---