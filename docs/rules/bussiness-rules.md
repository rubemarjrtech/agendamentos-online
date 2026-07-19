# Documentação de Requisitos: MVP de Agendamento

Este documento descreve as regras de negócio, fluxos de usuário e decisões arquiteturais para o MVP do sistema de agendamentos (Monolito Modular Node.js + React).

---

## 1. Autenticação e Perfis de Acesso

O sistema possui três atores principais com diferentes níveis de acesso:

| Perfil            | Cadastro             | Login                     | Acesso                      |
| ----------------- | -------------------- | ------------------------- | --------------------------- |
| **Cliente**       | Sim (E-mail e Senha) | JWT retornado no cadastro | Área de Agendamento.        |
| **Administrador** | Não (_Seeded_)       | Rota de login para admin  | Área de Gestão (Dashboard). |

- O Fluxo de Autenticação Para Usuário Comum

Login Simples: O usuário acessa a tela de login em Home e insere os dados.

Geração de Token: O front faz um POST /api/login e o token é retornado através de cookies.

- O Fluxo de Autenticação Para Admin (Hardcoded)

Credenciais no Servidor: O e-mail e a senha do admin ficam salvos de forma segura nas variáveis de ambiente do backend (ex: ADMIN_EMAIL e ADMIN_PASSWORD).

Login Simples: O admin acessa a tela de login (/admin/login) e insere os dados.

Geração de Token: O front faz um POST /api/admin/login. O backend compara os dados com as variáveis de ambiente e, se baterem, devolve um token JWT com uma role específica (ex: role: 'admin').

Sessão: A partir daí, o painel envia esse JWT no header de todas as requisições (Authorization: Bearer <token>).

---

## 2. Área do Cliente (Fluxo de Agendamento)

A interface utiliza o padrão de **Divulgação Progressiva** para otimizar requisições e guiar o usuário.

### Passo 1: Seleção de Serviço

O usuário seleciona o serviço desejado (ex: Corte de Cabelo). O calendário só é renderizado após esta seleção.

### Passo 2: Seleção de Data

O usuário escolhe o dia. O frontend inicia o _Short Polling_ (via TanStack Query) apenas neste momento, realizando requisições a cada 5 segundos para buscar horários livres.

### Passo 3: Grade de Horários

O backend cruza os agendamentos efetivados (Banco de Dados) com os horários em processo de reserva (Redis). Horários ocupados ou _locked_ são renderizados com a propriedade `disabled`.

### Passo 4: Intenção e Lock Temporário

O usuário clica em um horário livre.

- **Ação:** O frontend faz um `POST /api/locks`.
- **Processamento:** O backend tenta gravar uma chave no Redis (`lock:service:{id}:date:{data}:time:{hora}`) vinculada ao ID do usuário, com TTL de 5 minutos.
- **Cenário de Falha (Colisão):** O frontend exibe um aviso ("Horário recém-reservado"), invalida o cache do TanStack Query e a grade é atualizada instantaneamente.
- **Cenário de Sucesso:** O formulário de confirmação de dados é exibido (animado via Framer Motion).

### Passo 5: Confirmação Final

O cliente preenche os dados (Nome e Telefone) e submete. O backend valida se o _lock_ do Redis ainda pertence ao ID daquele usuário, salva o agendamento no Banco de Dados e deleta a chave do Redis.

---

## 3. Área Administrativa (Gestão)

Painel focado em visualização rápida e gerenciamento de status, sem necessidade de WebSockets (dados atualizados via navegação/polling).

### Funcionalidades

- **Listagem:** Tabela com todos os agendamentos e dados dos clientes (Nome, Telefone, E-mail).
- **Filtros:** Busca dinâmica via _query params_ (ex: `GET /api/admin/appointments?date=YYYY-MM-DD`).
- **Exclusão:** Possibilidade de realizar exclusão permanente (_hard delete_).

### Ciclo de Vida do Agendamento (Status)

| Status         | Comportamento no Sistema                                     |
| -------------- | ------------------------------------------------------------ |
| **Agendado**   | Padrão na criação. Horário bloqueado na grade.               |
| **Confirmado** | Ação manual do admin. Horário permanece bloqueado.           |
| **Concluído**  | Serviço finalizado. Horário permanece bloqueado (histórico). |
| **Cancelado**  | Libera o horário imediatamente na grade para o público.      |

---

## 4. Regras de Concorrência (Defesa em Profundidade)

A arquitetura utiliza três camadas de segurança para impedir duplo-agendamento:

1. **Trava de UX (Frontend):** O Polling periódico atualiza a interface, desabilitando botões para usuários que chegam atrasados na escolha do horário.
2. **Trava de Memória (Redis):** O comando de criação atômica garante que é matematicamente impossível dois clientes adquirirem o mesmo _lock_ simultaneamente.
3. **Trava de Banco de Dados (Fallback):** Uma _Unique Constraint_ (`data + hora + service_id`) na tabela SQL atua como última linha de defesa em caso de falha catastrófica do cache.
