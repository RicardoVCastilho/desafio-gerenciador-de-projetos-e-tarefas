## ProTask - Manager: Desafio Técnico

Sistema **fullstack** para **gerenciamento de projetos e tarefas**, permitindo organizar atividades **pendentes**e **concluídas** dentro de projetos em andamento.

---

## 🚀 Stacks (principais tecnologias)

### Backend

Node.js • Express • TypeScript • JWT • MongoDB (MongoDB driver + Mongoose)

### Frontend

React • Vite • TypeScript • React Router

---

## 📦 Bibliotecas (libs)

### Backend

bcryptjs • dotenv • cors • validator

### Frontend

axios • @radix-ui/react-dialog • sonner

---

## 🎯 O que o projeto faz?

- Permite **criar, editar e excluir projetos**
- Permite **criar e excluir tarefas dentro de um projeto**
- Lista tarefas de acordo com o usuário **responsável**
- Filtra tarefas por status:
  - **À Fazer**
  - **Em progresso**
  - **Feitas**
- Permite marcar tarefas como **feitas**

---

## ✅ Requisitos funcionais atendidos

1. Inserir um novo projeto ✅
2. Editar ou excluir um projeto ✅ _(com confirmação na exclusão e remoção das tarefas relacionadas)_
3. Criar uma tarefa em um projeto ✅
4. Excluir uma tarefa de um projeto ✅ _(com confirmação)_
5. Ver todas as tarefas de um projeto e filtrá-las por status ✅
6. Marcar uma tarefa como “concluída” ✅

---

## 📌 Regras de negócio (casos de uso)

### Projetos

- Criar projeto apenas com **nome** e **descrição**
- Editar nome a qualquer momento
- Excluir projeto solicita **confirmação** e remove tarefas relacionadas

### Tarefas

- Criar tarefa com:
  - **nome**
  - **responsável**
- Excluir tarefa com **confirmação**
- Status calculado/organizado em:
  - **Feito**
  - **Em progresso**
  - **À fazer**

### 🔐 Autenticação & Usuários (extra)

Além dos requisitos do desafio, o projeto inclui um **sistema completo de usuários** com:

- **Cadastro (registro)** de usuário
- **Login** com validação de credenciais
- **Autenticação via JWT**
- **Proteção de rotas** (apenas usuários autenticados podem acessar/alterar dados)
- **Hash de senha** com bcryptjs
- **Persistência de usuários** no MongoDB (Mongoose)

> Observação: o JWT é enviado pelo frontend e utilizado no backend para validar e autorizar requisições.

---

## 🧑‍💻 Autor

Projeto desenvolvido por [Ricardo Vitor Castilho](https://github.com/RicardoVCastilho)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**.
