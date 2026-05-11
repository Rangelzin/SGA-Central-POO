# 🤝 Contribuindo para o SGA-CENTRAL-POO

Este documento define as regras de contribuição para garantir consistência, qualidade e alinhamento arquitetural do projeto.

---

## 📌 Princípios Gerais

- Código deve seguir **SOLID e Clean Code**
- Nenhum código entra na `main` sem **Pull Request**
- Toda mudança deve ser **rastreável (commits padronizados + PR)**
- O sistema deve ser **evolutivo e desacoplado**

---

## 🌳 Fluxo de Branches

### Branch principal
- `main` → código estável e validado

### Branches de trabalho
- `feat/nome-da-feature`
- `fix/nome-do-bug`
- `refactor/nome-da-melhoria`

📌 Exemplos:
- `feat/cadastro-aluno`
- `fix/validacao-matricula`
- `refactor/camada-servico`

---

## 🔄 Workflow de Contribuição

1. Criar uma branch a partir da `main`
2. Implementar a funcionalidade
3. Garantir que o projeto builda (`mvn clean install`)
4. Criar Pull Request
5. Aguardar review
6. Merge após aprovação

🚫 Proibido:
- Commit direto na `main`
- Código sem revisão

---

## 🧾 Padrão de Commits

Utilizamos **Conventional Commits**:

### Estrutura:
```
tipo: descrição
```

### Tipos:
- `feat`: nova funcionalidade
- `fix`: correção de bug
- `refactor`: melhoria sem alteração de comportamento
- `docs`: documentação
- `test`: testes
- `chore`: tarefas auxiliares

### Exemplos:
```
feat: adiciona entidade aluno
fix: corrige cálculo de média
refactor: separa regra de negócio da controller
```

---

## 🧱 Padrões de Código

### Linguagem
- Código em **Inglês**
- Comentários apenas quando necessário

### Estrutura
- Controller → apenas orquestração
- Service → regras de aplicação
- Domain → regras de negócio
- Repository → acesso a dados

### Boas práticas
- Evitar classes com múltiplas responsabilidades
- Evitar lógica de negócio em controllers
- Não usar `@Autowired` em campo (preferir construtor)

---

## 🧪 Testes

### Obrigatório para novas features:
- Testes unitários para regras de negócio
- Testes de integração para endpoints críticos

### Ferramentas:
- JUnit
- Spring Boot Test

---

## 🐳 Ambiente de Desenvolvimento

Subir banco via Docker:

```
docker-compose up -d
```

---

## 🔐 Segurança

- Nunca commitar:
  - Senhas
  - Tokens
  - Arquivos `.env`

---

## 📦 Banco de Dados

- Utilizar migrations (Flyway ou equivalente)
- Não alterar schema manualmente em produção
- Cada mudança deve ser versionada

---

## 🔍 Code Review

Critérios de aprovação:

- Código legível e organizado
- Segue arquitetura definida
- Não viola princípios SOLID
- Não introduz dívida técnica desnecessária

---

## ⚠️ Regras Críticas

- Código sem testes → não entra
- Código fora da arquitetura → rejeitado
- Código duplicado → rejeitado

---

## 📌 Dúvidas

Antes de implementar algo relevante:
- Abrir issue
- Discutir abordagem com o time

---

## 🚀 Objetivo

Este repositório não é apenas um trabalho acadêmico.

É um **exercício de engenharia de software profissional**.

