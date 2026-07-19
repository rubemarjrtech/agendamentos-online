# 1. Nome do Projeto

Sistema de Agendamentos Online

# 2. Resumo do Projeto / Visão Geral

Este App é um sistema de Agendamento Online, onde o usuário pode criar uma conta, agendar horários (livres), visualizar agendamentos e também conta com um painel de admin.

# 3. Problemas que o Produto Resolve

Resolver problemas comuns nesse tipo de sistema como conflitos que afetam a Experiência do Usuário.

# 4. Público-alvo

Pessoas com 18+ de idade

# 5. Objetivos do Produto

Facilitar o gerenciamento de agendamentos por parte do provedor, e também o processo de agendamento do usuário.

# 6. Funcionalidades Principais (Core Features)

- Home (com tela de boas vindas e login/cadastro com email e senha inicialmente).
- Criar agendamento.
- Validação de formulários.
- Confirmação de agendamento na tela.
- Visualizar agendamentos.
- Painel de Admin.

# 7. Requisitos Técnicos (Stack, integrações, plataformas)

- Backend: NestJS, Prisma, Redis, Postgresql e Autenticação JWT Simples.
- Frontend: React, Vite e TailwindCSS
- Language: TypeScript

# 9. Requisitos Não-funcionais

- Armazenamento seguro dos dados
- Login com Email / Senha
- Interface responsiva em diferentes tamanhos de telas e intuitiva.

# 10. Critérios de Sucesso / Métricas

- Usuário consegue agendar com seus dados após criação de conta simples.
- Usuário consegue visualizar confirmação de agendamento ao final do processo.
- Usuário consegue visualizar seus agendamentos.
- Responsividade em diferentes telas.
- Painel de admin que visualiza todos os agendamentos, dados dos clientes, filtra agendamentos por data, altera status de atendimento (Agendado, Confirmado, Concluído e Cancelado) e cancela ou exclui agendamentos.
