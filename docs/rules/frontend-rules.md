# React Project Organization Guide

> Estas instruções definem a estrutura padrão de projetos React e devem ser seguidas para manter consistência, escalabilidade e facilidade de manutenção.

---

# Estrutura do Projeto

```text
📂 root
├── 📁 public
├── 📁 src
│   ├── 📁 assets
│   ├── 📁 components
│   ├── 📁 config
│   ├── 📁 layouts
│   ├── 📁 hooks
│   ├── 📁 pages
│   │   └── 📁 Login
│   │       ├── 📄 index.tsx
│   │       └── 📄 styles.ts
│   ├── 📁 services
│   │   └── 📄 api.ts
│   ├── 📁 store
│   ├── 📁 styles
│   │   ├── 📄 GlobalStyles.ts
│   │   └── 📁 themes
│   │       ├── 📄 Dark.ts
│   │       ├── 📄 Light.ts
│   │       └── 📄 index.ts
│   ├── 📁 utils
│   ├── 📄 main.tsx
│   ├── 📄 routes.tsx
│   └── 📄 vite-env.d.ts
├── 📄 .gitignore
├── 📄 index.html
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 README.md
└── 📄 vite.config.ts
```

---

# Regras Gerais

- Todo o código da aplicação deve permanecer dentro de `src`.
- Cada diretório possui uma responsabilidade única.
- Evite misturar responsabilidades entre pastas.
- Prefira componentes reutilizáveis.
- Mantenha a estrutura consistente entre páginas.
- Arquivos devem possuir nomes claros e previsíveis.

## Estrutura de Rotas

A aplicação deve utilizar uma arquitetura de rotas desacoplada, onde cada componente possui uma única responsabilidade.

A estrutura obrigatória é:

```text
App
 └── AppRoutes
      ├── Router
      ├── Providers
      ├── Rotas Públicas
      ├── ProtectedRoutes
      │      └── AppLayout
      │             └── Páginas Privadas
      └── NotFound
```

### Responsabilidades

- **App** deve apenas inicializar a aplicação.
- **AppRoutes** deve centralizar toda a configuração de roteamento.
- **ProtectedRoutes** deve ser responsável exclusivamente pela autenticação das rotas privadas.
- **AppLayout** deve conter o layout compartilhado entre páginas autenticadas (Header, Sidebar, Footer, etc.).
- As páginas não devem conhecer regras de autenticação.
- O layout nunca deve validar autenticação.
- A autenticação nunca deve renderizar elementos de layout.

Cada componente deve possuir apenas uma responsabilidade.

---

## Fluxo de Renderização

A renderização deve seguir exatamente esta sequência:

```text
App
    ↓
AppRoutes
    ↓
BrowserRouter
    ↓
Providers
    ↓
Routes
    ↓
ProtectedRoutes
    ↓
AppLayout
    ↓
Outlet
    ↓
Página
```

---

## Exemplo

### App.tsx

```tsx
import AppRoutes from "./routes";

const App = () => {
  return <AppRoutes />;
};

export default App;
```

---

### routes/index.tsx

```tsx
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { AuthProvider } from "@hooks/useAuth";
import AppLayout from "@layouts/AppLayout";
import ProtectedRoutes from "./ProtectedRoutes";

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}

          <Route element={<ProtectedRoutes />}>
            <Route element={<AppLayout />}>{/* Rotas privadas */}</Route>
          </Route>

          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
```

---

### layouts/AppLayout.tsx

```tsx
import { Outlet } from "react-router";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}

      <main className="grow py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
```

---

### routes/ProtectedRoutes.tsx

```tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@hooks/useAuth";

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
```

---

## Regras Obrigatórias

- `App.tsx` deve apenas renderizar `AppRoutes`.
- Toda configuração de roteamento deve permanecer em `routes/index.tsx`.
- Toda validação de autenticação deve ocorrer em `ProtectedRoutes`.
- Todo layout compartilhado deve permanecer em `AppLayout`.
- As páginas devem ser renderizadas através de `<Outlet />`.
- Não renderize Header, Sidebar ou Footer diretamente nas páginas.
- Não coloque lógica de autenticação dentro do Layout.
- Não coloque lógica de layout dentro de `ProtectedRoutes`.
- Providers globais (AuthProvider, ThemeProvider, QueryClientProvider, Redux Provider etc.) devem ser registrados em `AppRoutes`, acima das rotas.
- Todas as rotas privadas devem estar aninhadas dentro de `ProtectedRoutes`.
- Todas as rotas autenticadas que compartilham a mesma estrutura visual devem estar aninhadas dentro de `AppLayout`.

Esta arquitetura garante separação de responsabilidades, reutilização do layout, escalabilidade e facilidade de manutenção.

---

# Diretórios

## `public`

Contém arquivos públicos servidos diretamente pelo servidor.

Utilize para:

- favicon
- imagens públicas
- manifest
- robots.txt
- arquivos que não precisam passar pelo processo de build

Não coloque código React nesta pasta.

---

## `src`

É o núcleo da aplicação.

Todo código-fonte deve estar localizado dentro desta pasta.

---

## `assets`

Armazena recursos estáticos utilizados pela aplicação.

Exemplos:

- imagens
- ícones
- fontes
- SVGs
- vídeos
- arquivos estáticos importados pelo código

---

## `components`

Armazena componentes reutilizáveis.

Utilize esta pasta apenas para componentes compartilhados entre múltiplas páginas.

Exemplos:

- Button
- Input
- Modal
- Card
- Header
- Footer
- Loading

Caso um componente seja utilizado exclusivamente por uma página, mantenha-o dentro da própria pasta da página.

---

## `config`

Centraliza configurações da aplicação.

Exemplos:

- constantes globais
- variáveis compartilhadas
- configuração de bibliotecas
- plugins
- inicialização de SDKs
- arquivos de ambiente
- configurações de autenticação

---

## `hooks`

Contém React Hooks customizados.

Toda lógica reutilizável baseada em hooks deve ficar nesta pasta.

Exemplos:

- useAuth
- useDebounce
- useTheme
- useLocalStorage
- usePagination

---

## `pages`

Cada página deve possuir seu próprio diretório.

Estrutura recomendada:

```text
pages/
└── Login/
    ├── index.tsx
    └── styles.ts
```

O arquivo `index.tsx` representa o componente principal da página.

O arquivo `styles.ts` contém estilos específicos da página quando necessário.

Se a página possuir componentes exclusivos, mantenha-os dentro da própria pasta da página.

Exemplo:

```text
Login/
├── components/
├── hooks/
├── services/
├── styles.ts
└── index.tsx
```

---

## `services`

Centraliza comunicação com APIs e serviços externos.

Exemplos:

- Axios
- Fetch
- APIs REST
- GraphQL
- WebSocket
- autenticação
- upload de arquivos

Exemplo:

```text
services/
├── api.ts
├── auth.ts
├── users.ts
```

Evite realizar chamadas HTTP diretamente dentro dos componentes.

---

## `store`

Responsável pelo gerenciamento de estado global.

Pode conter implementações utilizando:

- Redux
- Redux Toolkit
- Zustand
- MobX

Organize reducers, slices, actions e selectors nesta pasta.

---

## `styles`

Contém estilos compartilhados da aplicação.

Exemplo:

```text
styles/
├── GlobalStyles.ts
└── themes/
```

Nesta pasta normalmente ficam:

- estilos globais
- reset CSS
- temas
- tokens de design
- tipografia
- cores

---

## `themes`

Responsável pelos temas da aplicação.

Exemplo:

```text
themes/
├── Dark.ts
├── Light.ts
└── index.ts
```

O arquivo `index.ts` deve centralizar as exportações dos temas.

---

## `utils`

Armazena funções utilitárias independentes de React.

Exemplos:

- formatadores
- validadores
- helpers
- cálculos
- manipulação de datas
- conversores

As funções desta pasta devem ser reutilizáveis e não depender de componentes.

---

# Boas Práticas

- Utilize TypeScript sempre que possível.
- Evite componentes excessivamente grandes.
- Extraia lógica complexa para hooks.
- Centralize chamadas HTTP em `services`.
- Centralize constantes em `config`.
- Utilize `utils` apenas para funções puras.
- Componentes compartilhados pertencem a `components`.
- Componentes exclusivos pertencem à página correspondente.
- Mantenha nomes de arquivos consistentes.
- Evite duplicação de código.
- Cada pasta deve possuir uma responsabilidade clara (Single Responsibility Principle).

---

# Objetivo

Esta estrutura busca:

- escalabilidade
- legibilidade
- facilidade de manutenção
- reutilização de código
- padronização entre projetos
- onboarding mais rápido de novos desenvolvedores
- separação clara de responsabilidades
