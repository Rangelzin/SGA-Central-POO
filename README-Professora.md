# README - Execucao para Avaliacao (POO)

Guia rapido para executar o sistema durante a avaliacao.

## Pre-requisitos

- Docker + Docker Compose
- Java 21

## Arquivos esperados na raiz

- docker-compose.poo.yml
- SGA-POO.jar
- .env

## Arquivo .env

Usar este conteudo na raiz do projeto:

```env
DB_URL=jdbc:postgresql://localhost:5432/SGAI
DB_USERNAME=SGAI
DB_PASSWORD=SGAI_1234
JWT_SECRET=chave_local
```

## Como executar

Na raiz do projeto:

```bash
docker compose -f docker-compose.poo.yml up -d
java -jar SGA-POO.jar
```

## Acessos

- Sistema: http://localhost:8080/login
- Swagger: http://localhost:8080/swagger-ui.html

## Usuarios de demonstracao

Senha padrao: 123456

- Admin: admin@ufg.br
- Professor: alan@ufg.br
- Aluno: ada@discente.ufg.br

## Rotas principais para demonstracao

- /dashboard
- /admin/students
- /admin/teachers
- /admin/subjects
- /admin/classes
- /student/enrollment
- /student/grades
- /student/transcript
- /teacher/classes

## Encerrar

```bash
docker compose -f docker-compose.poo.yml down
```
