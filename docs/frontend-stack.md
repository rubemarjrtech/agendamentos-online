# Frontend Stack — MVP de Agendamentos

Referência técnica do frontend. Para padrões de código e estrutura de pastas, consulte [frontend-rules.md](rules/frontend-rules.md). Para regras de negócio completas, consulte [bussiness-rules.md](rules/bussiness-rules.md).

## Visão geral

- **Arquitetura:** SPA (Single Page Application)
- **Framework:** React 19+
- **Linguagem:** TypeScript 5.7+
- **Runtime:** Navegador (Vite como bundler)
- **Gerenciador de pacotes:** pnpm
- **Diretório raiz:** `/frontend`

## Stack principal

| Camada        | Tecnologia            | Versão (package.json) |
| ------------- | --------------------- | --------------------- |
| Framework UI  | React                 | ^19.2.7               |
| Roteamento    | react-router          | ^8.2.0                |
| Estilização   | Tailwind CSS          | ^4.3.3                |
| UI Components | radix-ui              | ^1.6.4                |
| Ícones        | lucide-react          | ^1.25.0               |
| Animações     | framer-motion         | ^12.42.2              |
| HTTP Client   | axios                 | ^1.18.1               |
| Data Fetching | @tanstack/react-query | ^5.101.3              |
| Build Tool    | Vite                  | ^8.1.1                |

## Desenvolvimento local

Scripts disponíveis:

```bash
pnpm dev          # Vite em modo desenvolvimento (HMR)
pnpm build        # build de produção para dist/
pnpm preview      # preview da build de produção
pnpm lint:check   # ESLint
pnpm lint:fix     # ESLint com auto-fix
pnpm format       # Prettier (formatar código)
```

## Biblioteca de componentes UI

### Lucide React

Biblioteca de ícones SVG:

- Ícones utilizados conforme necessidade em cada componente
- Importação tree-shakable (apenas ícones usados são incluídos)

### Framer Motion

Sistema de animações para:

- Transições de página e rota
- Microinterações (hover, focus, click)
- Feedback visual (loading states, success/error)
- Opening/closing de menus e modais

## Gerenciamento de dados e estado

### @tanstack/react-query

Gerenciamento de server state:

- Cache automático de respostas da API
- Refetch em intervalos (polling ~5s para horários disponíveis)
- Invalidação de cache após mutações
- Loading e error states padronizados

Padrão de uso:

```tsx
// Query para polling de horários
const { data, isLoading } = useQuery({
  queryKey: ["available-slots", serviceId, date],
  queryFn: () => fetchAvailableSlots(serviceId, date),
  refetchInterval: 5000, // polling a cada 5s
  staleTime: 1000,
});

// Mutation para agendamento
const mutation = useMutation({
  mutationFn: createAppointment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["available-slots"] });
  },
});
```

### axios

HTTP client para comunicação com a API backend:

- Base URL configurada via variável de ambiente
- Interceptors para token JWT e tratamento de erros
- Tipagem de respostas e requisições

Padrão de configuração:

```tsx
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect para login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

## Roteamento

### react-router v8

Estrutura de rotas prevista (MVP):

| Rota            | Perfil  | Descrição                         |
| --------------- | ------- | --------------------------------- |
| `/`             | Público | Landing page / Seleção de serviço |
| `/login`        | Cliente | Login de cliente                  |
| `/signup`       | Cliente | Cadastro de novo cliente          |
| `/appointments` | Cliente | Meus agendamentos                 |
| `/admin`        | Admin   | Dashboard administrativo          |
| `/admin/login`  | Admin   | Login do admin                    |

## Estilo e tema

### Tailwind CSS v4

Configuração via CSS nativo (v4 não usa mais `tailwind.config.js`):

- Utility-first CSS framework
- Design responsivo com breakpoints padrão
- Variáveis CSS customizadas para tema

Padrão de importação (`src/styles/global.css`):

```css
@import "tailwindcss";

:root {
  /* Cores do tema */
  --color-primary: #xxx;
  --color-secondary: #xxx;

  /* Fontes */
  --font-sans: "Inter", system-ui, sans-serif;
}

@theme {
  --font-family-sans: var(--font-sans);
}
```

## Estrutura de pastas

```
frontend/
├── src/
│   ├── components/       # Componentes reutilizáveis (UI atoms)
│   ├── routes/           # Rotas da aplicação
│   ├── layouts/          # Layouts
│   ├── hooks/            # Hooks customizados
│   ├── lib/              # Utilitários e configurações (axios, queryClient)
│   ├── pages/            # Páginas completas
│   ├── styles/           # Estilos globais
│   ├── types/            # Tipos TypeScript compartilhados
│   ├── utils/            # Funções utilitárias puras
│   ├── App.tsx           # Root component + rotas
│   └── main.tsx          # Entry point + providers
├── public/               # Assets estáticos
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Variáveis de ambiente

Arquivo `.env` (não commitar) e `.env.example` (commitar com valores vazios):

| Variável        | Uso                               | Default                 |
| --------------- | --------------------------------- | ----------------------- |
| `VITE_API_URL`  | URL base da API backend           | `http://localhost:3000` |
| `VITE_APP_NAME` | Nome da aplicação (exibido na UI) | `Agendamento`           |

Acessar via `import.meta.env.VITE_*` (Vite injeta apenas variáveis com prefixo `VITE_`).

## Autenticação no frontend

### Fluxo de autenticação

1. **Cliente:** `POST /api/login` → armazena JWT no localStorage
2. **Admin:** `POST /api/admin/login` → armazena JWT no localStorage
3. Token persistido e enviado via header `Authorization: Bearer <token>`
4. Logout: remover token do localStorage + redirect
5. Proteger rotas no frontend (componente guard ou HOC)

### Tipos de usuário

```tsx
type UserRole = "client" | "admin";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
}
```

## Comunicação com backend

### Padrão de polling para horários

```tsx
// Consulta horários disponíveis com polling de 5s durante seleção
const useAvailableSlots = (serviceId: string, date: string) => {
  return useQuery({
    queryKey: ["available-slots", serviceId, date],
    queryFn: async () => {
      const { data } = await api.get(`/api/available-slots`, {
        params: { serviceId, date },
      });
      return data;
    },
    refetchInterval: 5000,
    enabled: !!serviceId && !!date,
  });
};
```

### Tratamento de colisão de lock

```tsx
const confirmAppointment = async (payload: CreateAppointmentDto) => {
  try {
    const { data } = await api.post("/api/appointments", payload);
    return data;
  } catch (error) {
    if (error.response?.status === 409) {
      // Horário foi ocupado por outro usuário
      // Invalidar cache e re-renderizar grade
      queryClient.invalidateQueries(["available-slots"]);
      throw new Error("Horário indisponível. Tente outro.");
    }
    throw error;
  }
};
```

## Decisões técnicas relevantes

- **Projeto utiliza estilo Mobile First:** Implementar estiles mobile first com tailwind
- **Sem SSR no MVP:** SPA pura com Vite — mais simples e rápido de desenvolver
- **Polling no cliente:** 5s para atualizar grade de horários (mesmo intervalo do backend)
- **Animações sutis:** framer-motion apenas para feedback e transições necessárias
- **TypeScript estrito:** tipos genéricos para respostas de API (`ApiResponse<T>`)
- **Forms:** controlar via React Hook Form se necessário (a decidir por feature)
- **Validação:** zod para schemas de formulário (opcional, por feature)

## Script de sincronismo com backend

Para tipos compartilhados, manter sincronizados com backend via manual ou script:

```bash
# Exemplo: copiar tipos do backend para o frontend
pnpm sync:types  # custom script a definir
```

Tipos críticos: `User`, `Appointment`, `Service`, `AppointmentStatus`.
