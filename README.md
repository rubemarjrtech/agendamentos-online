### Full-Stack Online Scheduling System

This project was built using React.js and NestJS.

## Technologies

The technologies used in this project are:

- NestJS
- React.js
- TypeScript
- PostgreSQL
- Redis
- Vite

## Dependencies

- Docker
- Docker Compose
- pnpm

## Local Project Setup

Clone the repository, then from the project root `/agendamento`, run:

`cd backend/`

**Create a `.env` file in the project root. Copy the environment variables from `.env.example` and fill them in before running the next commands; otherwise, the application startup will fail.**

**If you do not have Docker Compose installed, you can also create the containers using Docker Desktop.**

Then run:

`pnpm install --frozen-lockfile && pnpm docker:build && pnpm start:migrate:dev && pnpm seed:dev && pnpm start:dev`

Once the backend is running, open another terminal and, from the project root `/agendamento`, run:

`cd frontend/`

**Create a `.env` file in the project root. Copy the environment variables from `.env.example` and fill them in before running the next command; otherwise, the application startup will fail.**

Then run:

`pnpm dev`

## Access Credentials

I chose to define environment variables for both the administrator credentials and the admin access route.

The purpose is to reduce bot scanning and follow a standard production security practice, allowing you to freely define the admin route and credentials in your local environment.

The required environment variables are:

### `/frontend`

```env
VITE_ADMIN_URL=
```

### `/backend`

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

The admin login route simply validates the credentials by comparing them against these environment variables.

This login approach was intentionally designed to keep the implementation simple.

## How to use

- Create Account and Log in with your credentials:

<img width="1612" height="760" alt="image" src="https://github.com/user-attachments/assets/933404f8-9b25-4cbc-a011-c77c755e281f" />



- Select a Service:

<img width="1607" height="767" alt="image" src="https://github.com/user-attachments/assets/db5416d2-de68-4715-ba1d-07441dc0b213" />



- Next step shows whenever you select a service with a dropdown menu:

<img width="1613" height="776" alt="image" src="https://github.com/user-attachments/assets/a093f6f0-c0ea-4fef-885f-ab91b251cd1a" />



- Pick time after selecting date, slots already booked are not selectable:

<img width="1622" height="766" alt="image" src="https://github.com/user-attachments/assets/1322f863-48dd-4952-8f76-c0f28621333e" />



- Finish your details:


<img width="1618" height="781" alt="image" src="https://github.com/user-attachments/assets/618f3c24-5c8f-428a-983a-6da55a31745a" />



- Get confirmation toast and message:


<img width="1620" height="782" alt="image" src="https://github.com/user-attachments/assets/f5c4d35f-964f-4c16-ac37-9f55f966a136" />



- Website is responsive:

<img width="1622" height="768" alt="image" src="https://github.com/user-attachments/assets/a4484bda-4249-4abf-a1b1-6813530883de" />



- Admin can view appointments:


<img width="1626" height="775" alt="image" src="https://github.com/user-attachments/assets/626dc641-f6aa-4418-9c6c-d92d0a0b9220" />



## Features

The main features of the application are:

Avoiding race conditions when users pick the same time slot for the same service + date and giving user time to fill in his information.
Admin dashboard to manage appointments.

## Links

Repository: https://github.com/rubemarjrtech/agendamentos-online

In case of sensitive bugs like security vulnerabilities, please contact rubemarrocha22@gmail.com directly instead of using issue tracker. We value your effort to improve the security and privacy of this project!

## Versioning

1.0.0.0

## Authors

Rubemar Rocha de Souza Junior
Please follow github and join us! Thanks to visiting me and good coding!
