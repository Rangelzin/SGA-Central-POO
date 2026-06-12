# SGA — Frontend

Portal web do Sistema de Gestão Acadêmica, com três perfis de acesso (Administrador, Professor e Aluno) sobre a API REST Spring Boot. Implementado conforme o plano em [`docs/PLANO-FRONTEND.md`](../../docs/PLANO-FRONTEND.md).

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** + **shadcn/ui** (Radix)
- **TanStack Query** (estado de servidor) + **axios**
- **react-hook-form** + **Zod** (formulários e validação)
- **MSW** (mock da API durante o desenvolvimento)

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # ajuste se necessário
npm run dev                        # http://localhost:3000
```

### Usuários de demonstração (mocks ligados)

Todos com senha **`123456`**:

| E-mail | Perfil |
|--------|--------|
| `admin@sga.edu.br` | Administrador (Secretaria) |
| `professor@sga.edu.br` | Professor |
| `aluno@sga.edu.br` | Aluno |

## Mocks (MSW)

Com `NEXT_PUBLIC_ENABLE_MOCKS=true` (padrão em dev), toda a API é servida pelo
[MSW](https://mswjs.io) — um service worker intercepta as chamadas HTTP e responde
com dados em memória (`src/mocks/`). As regras de negócio testáveis estão nos
handlers: turma sem vaga e matrícula duplicada retornam **409**, ativação de
disciplina sem professor retorna **400**, status aprovado/reprovado segue a regra
*média ≥ 6.0 e frequência ≥ 75%*.

**Para usar o backend real (Fase 7):** defina no `.env.local`

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_ENABLE_MOCKS=false
```

O contrato esperado da API é a seção 8 do plano (`docs/PLANO-FRONTEND.md`).

## Estrutura (camadas — RNF-04)

```
src/
├── app/          # rotas e páginas (apresentação)
├── components/
│   ├── ui/       # shadcn/ui
│   └── shared/   # AppShell, DataTable, estados de UI, etc.
├── features/     # lógica por domínio (hooks de dados, schemas, forms)
├── lib/          # api client, query client, auth/RBAC, utils
├── types/        # modelo de domínio + DTOs da API
└── mocks/        # MSW (handlers + seed)
```

Convenções: componentes não chamam `axios` direto (sempre hooks de feature);
mensagens ao usuário em PT-BR; código e identificadores em inglês.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes (Vitest + Testing Library) |
| `npm run test:watch` | Testes em modo watch |

### Testes

Vitest + React Testing Library, com o mesmo MSW do app servindo de backend
(`msw/node`). Cobrem as regras de negócio testáveis:

- `lib/academic.test.ts` — regra de aprovação (média ≥ 6,0 e frequência ≥ 75%) e média ponderada (RF-05);
- `mocks/handlers/enrollments.test.ts` — matrícula com 409 de vaga cheia e duplicidade (RF-04);
- `mocks/handlers/subjects.test.ts` — ativação só com professor responsável (RF-03);
- `lib/utils.test.ts` — formatadores (CPF, nota, frequência);
- `features/students/hooks.test.tsx` — camada de dados (hook → axios → MSW);
- `components/shared/status-badge.test.tsx` — convenção visual de status.

## Notas de segurança

- O token de sessão fica em `localStorage` (suficiente para o escopo acadêmico).
  Em produção, a opção mais robusta seria cookie `httpOnly` emitido pelo backend.
- O RBAC do frontend é só UX (esconder telas/ações); a autorização real é
  responsabilidade do backend.
