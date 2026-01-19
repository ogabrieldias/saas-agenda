# 📅 Agenda App

Este projeto é um **aplicativo de agenda** desenvolvido com **React + Vite**, estilizado com **TailwindCSS + DaisyUI**, que implementa **login, registro de usuários, rotas privadas e um calendário de agendamentos**.  
O sistema utiliza **localStorage** para persistência e **crypto-js** para aplicar hash nas senhas, garantindo uma segurança mínima.

---
<br>

## 🚀 Tecnologias e frameworks usados

- **React** → Biblioteca principal para construção da interface.
- **Vite** → Ferramenta de build rápida e moderna para projetos React.
- **TailwindCSS** → Framework CSS utilitário para estilização.
- **DaisyUI** → Biblioteca de componentes prontos para Tailwind.
- **React Router DOM** → Gerenciamento de rotas e navegação.
- **crypto-js** → Biblioteca para gerar hash das senhas (SHA-256).
- **date-fns** → Biblioteca para manipulação de datas.
- **react-big-calendar** → Componente de calendário interativo.
- **chart.js react-chartjs-2** → Wrapper do React (Dashboard).


---
<br>

# 📅 Explicação do Projeto

Abaixo está a descrição detalhada de cada arquivo e pasta do projeto **Agenda App**:

---

## Arquivos principais

- **`App.jsx`** → Arquivo principal que define todas as rotas da aplicação e integra o componente `Navbar`.
- **`App.css`** → Configuração de estilos utilizando **TailwindCSS** e **DaisyUI**.

---

## 📂 Páginas (`pages/`)

- **`Login.jsx`** → Tela de login com validação de usuário e senha.  
- **`Register.jsx`** → Tela de cadastro de usuários, aplicando **hash de senha** com a biblioteca `crypto-js`.  
- **`Dashboard.jsx`** → Painel administrativo onde o prestador de serviço pode gerenciar seus agendamentos.  
- **`CalendarPage.jsx`** → Página de calendário interativo utilizando **react-big-calendar** e **date-fns**.

---

## 📂 Componentes (`components/`)

- **`PrivateRoute.jsx`** → Componente responsável por proteger rotas privadas, permitindo acesso apenas se houver **token** válido no `localStorage`.  

### 📂 Layout (`components/layout/`)

- **`Navbar.jsx`** → Barra de navegação condicional:  
  - Exibe **Login/Register** quando o usuário não está autenticado.  
  - Exibe **Dashboard/Calendar** e botão de **Logout** quando o usuário está autenticado.

---

## 📝 Resumo

- **App.jsx** → Gerencia rotas e integra Navbar.  
- **App.css** → Configuração de temas e estilos.  
- **pages/** → Contém as páginas principais (Login, Register, Dashboard, Calendar).  
- **components/** → Contém componentes auxiliares como `PrivateRoute` e `Navbar`.  
- **Navbar.jsx** → Exibe links diferentes dependendo do estado de autenticação.  
- **PrivateRoute.jsx** → Garante que apenas usuários autenticados acessem rotas privadas.  
---
<br>

# 📂 Estrutura de pastas

- src/
- ├── App.jsx
- ├── pages/
- │    ├── Login.jsx
- │    ├── Register.jsx
- │    ├── Dashboard.jsx
- │    └── CalendarPage.jsx
- ├── components/
- │    ├── PrivateRoute.jsx
- │    └── layout/
- │         └── Navbar.jsx





---

## 🔒 Segurança mínima implementada

- **Cadastro (Register.jsx):**
  - Usuário informa nome, email e senha.
  - Email é normalizado (`trim()` e `toLowerCase()`).
  - Senha é convertida em **hash SHA-256** antes de ser salva.
  - Usuário é armazenado em `localStorage` na chave `usuarios`.

- **Login (Login.jsx):**
  - Usuário informa email e senha.
  - Senha digitada é convertida em hash e comparada com a salva.
  - Se válido, é criado um **token simples** em `localStorage` (`token`).
  - Navegação para `/dashboard`.

- **Token:**
  - Usado apenas como flag de sessão.
  - Se presente, Navbar mostra páginas privadas.
  - Se ausente, Navbar mostra apenas Login e Register.

---

## 🧭 Navbar condicional

- **Sem token (não logado):** mostra apenas **Login** e **Register**.
- **Com token (logado):** mostra **Dashboard**, **CalendarPage** e botão de **Logout**.
- **Logout:** remove token e redireciona para `/login`.

---

## 🛡️ Proteção de rotas

- Implementada com **PrivateRoute.jsx**:
  - Se não houver token, redireciona para `/login`.
  - Se houver token, renderiza a página privada.

Exemplo no `App.jsx`:

```jsx
<Route
  path="/dashboard"
  element={
    <PrivateRoute>
      <Dashboard />
    </PrivateRoute>
  }
/>
```



## 📄 Fluxo de uso
- Cadastro: usuário cria conta → senha é salva como hash.

- Login: usuário entra → senha digitada é convertida em hash e comparada.

- Token: se login válido, token é salvo → Navbar muda e rotas privadas ficam acessíveis.

- Logout: token é removido → volta para tela de login.

## 🔎 Como visualizar dados
- Abra DevTools → aba Application → Local Storage.

- Chave usuarios: lista de usuários com senha em hash.

- Chave token: indica se há sessão ativa.

- Exemplo de usuário salvo:
  ```jsx
  {
  "nome": "admin",
  "email": "admin@gmail.com",
  "senha": "8d969eef6ecad3c29a3a629280e686cf..."
  
  }
  ```
## ⚠️ Limitações
- Senhas estão protegidas apenas com hash SHA-256 (sem salt).

- Token é apenas uma flag simples, sem expiração.

- Não há backend nem banco de dados.

- Em produção, o ideal seria:

- Usar bcrypt com salt para senhas.

- Implementar JWT ou sessões reais.

- Armazenar usuários em banco de dados seguro.

## ✅ Conclusão
- Este projeto demonstra:

- Como criar login e cadastro em React.

- Como usar localStorage para simular autenticação.

- Como aplicar hash de senha para segurança mínima.

- Como proteger rotas com PrivateRoute.

- Como condicionar o Navbar ao estado de login.

- É uma base simples, mas já evita exposição direta de senhas e mostra conceitos importantes de autenticação.