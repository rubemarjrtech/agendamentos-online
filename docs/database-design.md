# Design do Banco de Dados - MVP de Agendamentos

Modelo relacional simplificado, focando na trava por serviço.

## Diagrama Lógico (Entidades)

### 1. Tabela: `users` (Clientes e Usuários Gerais)

Armazena os dados de autenticação. Nativamente preparada para controle de acesso baseado em funções (RBAC).

| Coluna          | Tipo           | Restrições                 | Descrição                             |
| :-------------- | :------------- | :------------------------- | :------------------------------------ |
| `id`            | UUID / String  | PRIMARY KEY                | Identificador único do usuário.       |
| `email`         | VARCHAR        | UNIQUE, NOT NULL           | E-mail para login.                    |
| `password_hash` | VARCHAR        | NOT NULL                   | Senha criptografada.                  |
| `role`          | VARCHAR / ENUM | NOT NULL, DEFAULT 'CLIENT' | Perfil de acesso (`CLIENT`, `ADMIN`). |
| `created_at`    | TIMESTAMP      | DEFAULT NOW()              | Data de criação da conta.             |

### 2. Tabela: `services` (Serviços)

Tabela alimentada via _seed_ (sem tela de cadastro no MVP). Representa o catálogo do estabelecimento.

| Coluna     | Tipo       | Restrições   | Descrição                                 |
| :--------- | :--------- | :----------- | :---------------------------------------- |
| `id`       | INT / UUID | PRIMARY KEY  | Identificador do serviço.                 |
| `name`     | VARCHAR    | NOT NULL     | Nome (ex: "Corte de Cabelo", "Consulta"). |
| `duration` | INT        | NOT NULL     | Duração estimada em minutos (ex: 30, 60). |
| `active`   | BOOLEAN    | DEFAULT TRUE | Permite desativar serviços no futuro.     |

### 3. Tabela: `appointments` (Agendamentos)

O coração do sistema. Relaciona o cliente logado ao serviço escolhido, guardando os dados de contato preenchidos na hora da reserva.

| Coluna         | Tipo          | Restrições    | Descrição                                     |
| :------------- | :------------ | :------------ | :-------------------------------------------- |
| `id`           | UUID / String | PRIMARY KEY   | Identificador único do agendamento.           |
| `user_id`      | UUID          | FOREIGN KEY   | Referência ao cliente logado (`users.id`).    |
| `service_id`   | UUID          | FOREIGN KEY   | Referência ao serviço (`services.id`).        |
| `client_name`  | VARCHAR       | NOT NULL      | Nome informado no momento do agendamento.     |
| `client_phone` | VARCHAR       | NOT NULL      | Telefone informado no momento do agendamento. |
| `date`         | DATE          | NOT NULL      | Data do agendamento (ex: 2026-07-20).         |
| `time`         | TIME / String | NOT NULL      | Hora do agendamento (ex: "14:00").            |
| `status`       | ENUM          | NOT NULL      | Estado atual da reserva.                      |
| `created_at`   | TIMESTAMP     | DEFAULT NOW() | Data em que o registro foi criado.            |
| `updated_at`   | TIMESTAMP     | DEFAULT NOW() | Data da última alteração de status.           |

---

## Tipos e Enums

### Enum: `AppointmentStatus`

Valores permitidos para a coluna `status` da tabela `appointments`:

- `SCHEDULED` (Agendado - Valor padrão na criação)
- `CONFIRMED` (Confirmado pelo admin)
- `COMPLETED` (Concluído)
- `CANCELLED` (Cancelado)

---

## Índices e Travas de Banco (A Defesa em Profundidade)

Para que o Banco de Dados atue como nosso _fallback_ definitivo contra duplo-agendamento (caso o Redis falhe), precisamos de um **Índice Único Parcial**.

- **Índice:** `UNIQUE (date, time, service_id)`
- **Condição (Parcial):** `WHERE status != 'CANCELLED'`

**Por que a condição é importante?**
Se um agendamento for cancelado, a vaga às 14h volta a ficar disponível. Se fizermos um _Unique_ simples, o banco de dados impedirá que um novo cliente agende às 14h só porque existe uma linha antiga cancelada lá.
O índice parcial garante que a trava de exclusividade só se aplica a horários que estão ativamente ocupados (`SCHEDULED`, `CONFIRMED` ou `COMPLETED`).
