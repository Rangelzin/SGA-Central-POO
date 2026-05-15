# Sistema de Gestão Acadêmica (SGA)

## 📌 Descrição do Projeto
Este projeto consiste no desenvolvimento de um Sistema de Gestão Acadêmica (SGA) para uma universidade de médio porte, com o objetivo de substituir um sistema legado fragmentado por uma solução integrada, escalável e segura.

O sistema irá centralizar a gestão de:
- Alunos
- Professores
- Disciplinas
- Matrículas
- Notas e Frequências

---

## 👥 Integrantes
- Bruno Ferreira Silva
- Tiago Sales Ribeiro
- Victor Rangel Tasse Magalhães
- Walisson Fagundes Santana

---

## 🎯 Objetivo
Desenvolver uma plataforma unificada que:
- Elimine a fragmentação dos sistemas atuais
- Garanta integridade dos dados acadêmicos
- Facilite a emissão de históricos e relatórios

---

## ⚠️ Desafios do Projeto
- Resistência dos usuários à mudança
- Prazo restrito
- Equipe reduzida

---

## 🧱 Escopo Funcional
- Gerenciamento de alunos, professores e disciplinas
- Matrícula e enturmação
- Registro de notas e frequência
- Emissão de históricos e relatórios
- Portais web responsivos

---

## 🚫 Fora do Escopo
- Refatoração dos sistemas legados
- Gestão contábil interna
- Infraestrutura física de rede
- integração com sistemas legados (financeiro e biblioteca)
---

## 🏗️ Arquitetura

### Modelo Arquitetural
Proposta inicial baseada em **Arquitetura em Camadas (Layered Architecture)**:

```mermaid
flowchart TD
    A[Cliente Web\nHTML + CSS] --> B[Camada de Apresentação\nControllers REST]
    B --> C[Camada de Aplicação\nServices / Use Cases]
    C --> D[Camada de Domínio\nEntidades + Regras de Negócio]
    D --> E[Camada de Infraestrutura\nRepositories + Integrações]
    E --> F[(PostgreSQL)]
```

### Estrutura de Pastas (Spring Boot)

```
sga/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/sga/
│       │       ├── controller/        # Camada de Apresentação
│       │       │   ├── AlunoController.java
│       │       │   ├── ProfessorController.java
│       │       │   └── DisciplinaController.java
│       │       ├── service/           # Camada de Aplicação
│       │       │   ├── AlunoService.java
│       │       │   ├── ProfessorService.java
│       │       │   └── MatriculaService.java
│       │       ├── domain/            # Camada de Domínio
│       │       │   ├── model/
│       │       │   │   ├── Aluno.java
│       │       │   │   ├── Professor.java
│       │       │   │   ├── Disciplina.java
│       │       │   │   └── Matricula.java
│       │       │   └── exception/
│       │       │       └── SgaException.java
│       │       ├── repository/        # Camada de Infraestrutura
│       │       │   ├── AlunoRepository.java
│       │       │   └── ProfessorRepository.java
│       │       └── SgaApplication.java
│       └── resources/
│           ├── application.properties
│           └── db/
│               └── migration/         # Flyway migrations
├── frontend/                          # HTML + CSS estático
│   ├── **.jsx              # Desenvolvimento do Front-end em React
├── docker-compose.yml
├── Dockerfile
├── CONTRIBUTING.md
└── README.md
```

---

## ⚙️ Tecnologias

| Camada        | Tecnologia         | Status         |
|---------------|--------------------|----------------|
| Backend       | Spring Boot        | ✅ Definido    |
| Banco de Dados| PostgreSQL         | ✅ Definido    |
| Container     | Docker             | ✅ Definido    |
| Frontend      | React + Nextjs     | ✅ Definido    |
| Autenticação  | A definir          | ⏳ Pendente    |

---

## 🔐 Requisitos Não Funcionais
- Segurança (autenticação e autorização)
- Escalabilidade
- Responsividade
- Consistência de dados

---

## 🚀 Como Rodar (Em construção)

> Será definido nas próximas etapas.

---

## 📊 Modelagem (Em Construção)
- Casos de Uso
- Diagrama de Classes
- Requisitos Funcionais e Não Funcionais

---

## 📎 Observações
Este repositório representa a evolução incremental do projeto acadêmico de POO, com foco em boas práticas de engenharia de software, arquitetura limpa e escalabilidade.
