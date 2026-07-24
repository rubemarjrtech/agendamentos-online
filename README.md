### Sistema de Agendamento Online FullStack

Este projeto foi feito utilizando React.js e NestJS.

## Tecnologias

As tecnologias utilizadas neste projeto foram:

- NestJS
- React.js
- TypeScript
- PostgreSQL
- Redis
- Vite

## Ferramentas de IA utilizadas

- Free Claude Code com modelos grátis. Link de como usar: https://github.com/Alishahryar1/free-claude-code
- Github Copilot. Com o roteamento de modelo da ferramenta, o modelo disponibilizado foi o gpt-5.4-mini

## Dependencias

- Docker
- Docker Compose
- pnpm

## Configuração do projeto localmente

Clone o repositório, e a partir da raiz do projeto /agendamento, rode:
`cd backend/`

**Crie um arquivo .env na raiz do projeto, copie e preencha as variáveis de ambiente com base em .env.example antes de rodar os próximos comandos, se não, a inicialização irá falhar**

**Se não possuir o docker compose instalado, também é possível criar os containers pelo Docker Desktop**

Em seguida, rode o comando:
`pnpm install --frozen-lockfile && pnpm docker:build && pnpm start:migrate:dev && pnpm seed:dev && pnpm start:dev`

Com o backend inicializado, em um outro terminal, a partir da pasta raiz do projeto /agendamento, rode:
`cd frontend/`

**Crie um arquivo .env na raiz do projeto, copie e preencha as variáveis de ambiente com base em .env.example antes de rodar o próximo comando, se não, a inicialização irá falhar**

Em seguida, rode o comando:
`pnpm dev`

## Credenciais de acesso

Optei por definir variáveis de ambiente para credenciais e para a rota de acesso do Admin.
O propósito é evitar varreduras de Bots e como prática de segurança padrão em produção, então é possível definir a rota e as credenciais de admin livremente localmente.

As variáveis são:

/frontend
VITE_ADMIN_URL=

/backend
ADMIN_EMAIL=
ADMIN_PASSWORD=

A rota de login do admin vai apenas validar comparando com essas variáveis.
Essa forma de login foi feita com o intuito de simplicidade.

## Explicação das decisões técnicas

O principal foco foi a experiência do usuário, que pode ser frustrante em sistemas de agendamento.
A decisão por redis (como cache para travas de horário) e short polling (requisições espaçadas, em vez de websockets) para buscar horários, se deu por alguns motivos:

- Para melhorar a experiência do usuário, não queria que ele fosse até o final do fluxo só para receber uma mensagem de erro, isso é frustrante, então optei por uma estratégia de trava de serviço-data-horário, quando o usuário seleciona um horário, automaticamente ninguém mais vai poder selecionar o mesmo horário por 5 minutos (tempo para o usuário preencher o resto do formulário)
- A partir da decisão de usar short polling em vez de websockets (que aumentariam a complexidade do desenvolvimento), salvar travas de horário no banco não era uma opção porque sobrecarregaria o banco. O polling é feito de 5 em 5 segundos, então a medida que a quantidade de usuários cresce, a quantidade de requisições também, o que pode ser catastrófico no quesito lentidão e experiência do usuário em produção.
- A partir disso, veio a decisão por usar o Redis como cache para as travas de horários. Além de ser performático, as travas tem TTL de 5 minutos e se já houver uma trava para aquele serviço, dia e horário, a requisição nem chega a tocar o banco, então há uma ganho de performance.
- O Redis também pode cair e quebrar a aplicação, mas na balança, os trade-offs pareceram melhores, na minha opinião, com o Redis.
- Monolito Modular no backend para facilitar e simplificar o desenvolvimento, garantindo separação de responsabilidades e facilidade de manutenção. O NestJS, na minha opinião, brilha em monolitos modulares.
- Estrutura Clássica no frontend para agrupar por responsabilidade. Tenho mais familiaridade com React.
