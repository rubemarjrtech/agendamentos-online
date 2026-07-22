# Projeto: Backend MVP de Agendamentos

## Stack Principal

- **Framework:** NestJS (TypeScript 5.7+, Node.js)
- **Banco e ORM:** PostgreSQL + Prisma (Client gerado em `src/generated/prisma`)
- **Cache/Locks:** Redis (ioredis)
- **Gerenciador de pacotes:** pnpm

## Mapa de Contexto e Regras

Antes de modificar ou criar novas funcionalidades, leia a documentação correspondente usando suas ferramentas:

- **Arquitetura:** Leia `docs/architecture.md` para entender sobre a arquitetura.
- **Regras de Negócio e Fluxos (OBRIGATÓRIO):** Consulte `docs/rules/bussiness-rules.md`.
- **Padrões de Código NestJS:** Consulte `docs/rules/backend-rules.md`.
- **Convenções de Banco de Dados:** Consulte `docs/schema-conventions.md` e `docs/migration-best-practices.md`.
- **Design do Banco de Dados:** Consulte `docs/database-design.md`.
- **Overview e Stack utilizada no Back End**: Consulte `docs/backend-stack.md`
- **Padrões de Código e Estruturação de pastas Frontend com React:** Consulte `docs/frontend-rules.md`

## Diretrizes Inquebráveis

1. **Comprometimento** NUNCA reescreva código "só para funcionar/validar", sempre siga a risca o que foi pedido pelo usuário e o que há escrito na documentação (docs). Caso esteja em uma situação que não sabe o que fazer, por exemplo ao não conseguir iniciar a aplicação, ou o estilo/escrita de código que foi pedido causa bugs/quebre a aplicação, reporte ao usuário e aguarde seu feedback sobre o que fazer.
2. **Nunca altere o client Prisma manualmente.** Ele é gerado em `node_modules`.
3. **Concorrência:** Qualquer rota de agendamento deve respeitar o lock atômico no Redis (TTL de 5 min) antes de tocar no PostgreSQL.
4. **Erros:** Use sempre exceptions do NestJS e filters globais. Não espalhe `try/catch`.
5. **Validação:** Todas as rotas devem ter validação de body, params e query via DTOs e Pipes.

## Comandos Úteis

- Subir infra local: `pnpm docker:up`
- Parar infra local: `pnpm docker:down`
- Iniciar API: `pnpm start:dev`
- Lint: `pnpm lint:check`
