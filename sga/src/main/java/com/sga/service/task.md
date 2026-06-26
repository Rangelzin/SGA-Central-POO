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
- [~] PessoaService: PULADO — autenticação já está no AuthService; CRUD já está em Aluno/Professor (ver docs/ALTA-3-STATUS.md)
- [x] AlunoService: criar, listar, editar, deletar aluno
- [x] ProfessorService: CRUD professor
- [x] DisciplinaService: CRUD + código único + ativar/desativar (RF-03: responsável derivado das turmas — V008)
- [x] TurmaService: CRUD + capacidade/vagas (RF-04 — campo capacidade em Turma, V006)
- [x] MatriculaService: criar matrícula, cancelar, validar duplicidade, validar vagas (RF-04)
- [x] AvaliacaoService: registrar nota, registrar frequência, calcular aprovação + média ponderada (RF-05 — peso em Avalia, V007)
- [x] RelatorioService: gerar histórico acadêmico (RF-06), gerar relatório de turma (RF-07)
- [x] Implementar @Transactional em operações críticas
- [x] Implementar exception handling com SgaException
- [x] Adicionar validações de regra de negócio
- [x] Adicionar logging (SLF4J)
- [x] Criar testes unitários com Mockito (cobertura ≥ 70%)
- [ ] Compilar sem erros — pendente: validar no WSL (JDK 21)

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