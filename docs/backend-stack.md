# Backend Stack — MVP de Agendamentos

Referência técnica do backend. Para padrões de código e estrutura de pastas, consulte [backend-rules.md](rules/backend-rules.md). Para regras de negócio completas, consulte [bussiness-rules.md](rules/bussiness-rules.md).

## Visão geral

- **Arquitetura:** Monolito Modular (NestJS)
- **Linguagem:** TypeScript 5.7+
- **Runtime:** Node.js
- **Gerenciador de pacotes:** pnpm
- **Diretório raiz:** `/backend`

## Stack principal

| Camada           | Tecnologia               | Versão (package.json) |
| ---------------- | ------------------------ | --------------------- |
| Framework        | NestJS                   | ^11.0.1               |
| ORM              | Prisma                   | ^7.8.0                |
| Banco relacional | PostgreSQL               | via Docker            |
| Cache / locks    | Redis (ioredis)          | ^5.11.1               |
| Autenticação     | JWT (@nestjs/jwt)        | ^11.0.2               |
| Configuração     | @nestjs/config + dotenv  | ^4.0.4                |
| HTTP             | @nestjs/platform-express | ^11.0.1               |
| Adapter Prisma   | @prisma/adapter-pg       | ^7.8.0                |

## Infraestrutura local (Docker)

Serviços definidos em `backend/docker-compose.yml`:

- **PostgreSQL** — container `api-agendamentos`, porta `5432`
- **Redis** — porta `${REDIS_PORT:-6379}`, com senha via `REDIS_PASSWORD`

Scripts úteis:

```bash
pnpm docker:up      # sobe containers em background
pnpm docker:build   # build + sobe containers
pnpm docker:down    # derruba containers
```

## Prisma

- **Schema:** `backend/prisma/schema.prisma`
- **Config:** `backend/prisma.config.ts` (Prisma 7 — URL via `DATABASE_URL`)
- **Migrations:** `backend/prisma/migrations`
- **Client gerado em:** `backend/src/generated/prisma` (não editar manualmente)

Convenções de schema: [schema-conventions.mdc](mdc:.cursor/rules/schema-conventions.mdc) e [migration-best-practices.mdc](mdc:.cursor/rules/migration-best-practices.mdc).

### Entidades previstas (MVP)

| Modelo        | Propósito                                    |
| ------------- | -------------------------------------------- |
| `User`        | Clientes (`CLIENT`) e admin (`ADMIN`)        |
| `Service`     | Catálogo de serviços (seed, sem CRUD no MVP) |
| `Appointment` | Agendamentos vinculados a user + service     |

### Enum `AppointmentStatus`

- `SCHEDULED` — padrão na criação; bloqueia horário
- `CONFIRMED` — confirmação manual do admin; bloqueia horário
- `COMPLETED` — serviço finalizado; bloqueia horário (histórico)
- `CANCELLED` — libera o horário imediatamente na grade

### Índice único parcial (anti double-booking)

```
UNIQUE (date, time, service_id) WHERE status != 'CANCELLED'
```

Garante que cancelamentos liberem a vaga sem impedir novos agendamentos no mesmo horário.

## Redis — locks temporários

Padrão de chave:

```
lock:service:{serviceId}:date:{YYYY-MM-DD}:time:{HH:mm}
```

- **TTL:** 5 minutos
- **Operação:** criação atômica (impossível dois clientes obterem o mesmo lock)
- **Validação:** na confirmação final, verificar se o lock pertence ao `userId` antes de persistir no banco
- **Cleanup:** deletar a chave após salvar o agendamento com sucesso

## Autenticação

| Perfil      | Cadastro             | Login                   | Token                    |
| ----------- | -------------------- | ----------------------- | ------------------------ |
| **Cliente** | Sim (e-mail + senha) | `POST /api/login`       | JWT com `role: 'client'` |
| **Admin**   | Não (seeded / env)   | `POST /api/admin/login` | JWT com `role: 'admin'`  |

- Admin compara credenciais com variáveis de ambiente (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Rotas protegidas exigem `Authorization: Bearer <token>` (exceto cadastro e login)
- Senhas nunca retornam no body da resposta; usar hash no banco

## Contratos de API (MVP)

### Área do cliente

| Método | Rota         | Descrição                                              |
| ------ | ------------ | ------------------------------------------------------ |
| POST   | `/api/login` | Login de cliente                                       |
| POST   | `/api/locks` | Reserva temporária de horário (Redis)                  |
| GET    | `/api/...`   | Horários disponíveis (consultado via polling ~5s)      |
| POST   | `/api/...`   | Confirmação final do agendamento (valida lock + salva) |

Fluxo de agendamento (divulgação progressiva):

1. Selecionar serviço → 2. Selecionar data → 3. Polling de horários livres → 4. Lock temporário → 5. Formulário (nome + telefone) → 6. Confirmação

Em colisão de lock: retornar erro claro; frontend invalida cache e atualiza a grade.

### Área administrativa

| Método | Rota                            | Descrição                         |
| ------ | ------------------------------- | --------------------------------- |
| POST   | `/api/admin/login`              | Login do admin                    |
| GET    | `/api/admin/appointments?date=` | Listagem com filtro por data      |
| PATCH  | `/api/admin/appointments/:id`   | Alterar status                    |
| DELETE | `/api/admin/appointments/:id`   | Exclusão permanente (hard delete) |

Dados exibidos: nome, telefone, e-mail do cliente, serviço, data, hora e status.

## Defesa em profundidade (concorrência)

Três camadas contra duplo-agendamento:

1. **UX (frontend):** polling periódico (~5s) desabilita horários ocupados ou locked
2. **Redis:** lock atômico com TTL de 5 minutos
3. **PostgreSQL:** índice único parcial como fallback se o cache falhar

## Variáveis de ambiente

Nunca commitar `.env`. Manter `.env.example` atualizado com chaves e valores vazios.

| Variável            | Uso                                  |
| ------------------- | ------------------------------------ |
| `DATABASE_URL`      | Conexão PostgreSQL (Prisma)          |
| `POSTGRES_USER`     | Usuário do container Postgres        |
| `POSTGRES_PASSWORD` | Senha do container Postgres          |
| `POSTGRES_DATABASE` | Nome do banco                        |
| `REDIS_PORT`        | Porta do Redis (default: 6379)       |
| `REDIS_PASSWORD`    | Senha do Redis                       |
| `ADMIN_EMAIL`       | E-mail do administrador              |
| `ADMIN_PASSWORD`    | Senha do administrador               |
| `PORT`              | Porta da API NestJS (default: 3000)  |
| `JWT_*`             | Segredos e configuração do token JWT |

Preferir config type-safe com `registerAs` do `@nestjs/config` — ver [backend-rules.mdc](mdc:.cursor/rules/backend-rules.mdc).

## Estrutura e aliases

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/              # módulo raiz
│   └── <feature-module>/ # um módulo por domínio
├── docker-compose.yml
├── prisma.config.ts
└── package.json
```

**Path alias (tsconfig):** `@app/*` → `./src/app/*`

Ao criar novos módulos de domínio, adicionar alias correspondente em `tsconfig.json`.

## Scripts de desenvolvimento

```bash
pnpm start:dev    # NestJS em watch mode
pnpm build        # compila para dist/
pnpm test         # testes unitários (Jest)
pnpm test:e2e     # testes e2e (Supertest)
pnpm lint:check   # ESLint
pnpm lint:fix     # ESLint com auto-fix
```

## Decisões técnicas relevantes

- **Sem WebSockets no MVP:** dados do admin atualizados via navegação/polling
- **Short polling no cliente:** TanStack Query no frontend, intervalo ~5s após seleção de data
- **Abstrações:** módulos voláteis (token, cache/redis) devem usar protocol/interface — ver backend-rules
- **Erros:** preferir exceptions NestJS + filters globais em vez de try/catch espalhados
- **Validação:** validar body, params e query em todas as rotas (DTOs + pipes)
- **Rate limiting:** obrigatório em rotas de auth e endpoints públicos
