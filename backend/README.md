# Duck Barbearia - Backend

Este é o servidor backend para a aplicação de agendamento da Duck Barbearia. Ele foi construído com Node.js, Express, TypeScript e se conecta a um banco de dados MongoDB.

## Funcionalidades

- API RESTful para gerenciar Serviços, Agendamentos e Clientes.
- Autenticação de administrador com JWT (JSON Web Tokens).
- Armazenamento de senhas de forma segura com bcrypt.
- Gerenciamento de configurações de personalização da UI.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (instância local ou uma conta no MongoDB Atlas)

## Instalação e Configuração

1.  **Clone o repositório (se ainda não o fez):**
    ```bash
    git clone <url-do-seu-repositorio>
    cd <pasta-do-projeto>/backend
    ```

2.  **Instale as dependências:**
    Navegue até a pasta `backend` e rode o comando:
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    - Crie uma cópia do arquivo `.env.example` e renomeie para `.env`.
      ```bash
      cp .env.example .env
      ```
    - Abra o arquivo `.env` e preencha as variáveis:
      - `PORT`: A porta para o servidor (padrão `5000`).
      - `MONGODB_URI`: Sua string de conexão do MongoDB.
      - `JWT_SECRET`: Uma string longa e aleatória para a segurança dos tokens.
      - `DEFAULT_ADMIN_PASSWORD`: A senha inicial para o painel de admin.

## Rodando o Servidor

Para iniciar o servidor em modo de desenvolvimento (com recarregamento automático ao salvar arquivos):

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:5000` (ou a porta que você configurou).

Para compilar o projeto para produção:

```bash
npm run build
```

Para iniciar o servidor em modo de produção (após compilar):
```bash
npm start
```

## Estrutura da API

As rotas da API estão prefixadas com `/api`.

- **Autenticação:**
  - `POST /api/auth/login`: Realiza o login do administrador.
  - `POST /api/auth/change-password`: Altera a senha do administrador (requer autenticação).

- **Serviços:**
  - `GET /api/services`: Lista todos os serviços (público).
  - `POST /api/services`: Cria um novo serviço (protegido).
  - `PUT /api/services/:id`: Atualiza um serviço (protegido).
  - `DELETE /api/services/:id`: Deleta um serviço (protegido).

- **Agendamentos:**
  - `GET /api/appointments/availability?date=<YYYY-MM-DD>&serviceId=<id>`: Retorna horários disponíveis para uma data e serviço.
  - `POST /api/appointments`: Cria um novo agendamento (público).
  - `GET /api/appointments`: Lista todos os agendamentos para o admin (protegido).

- **Configurações:**
  - `GET /api/settings`: Retorna as configurações de personalização (público).
  - `PUT /api/settings`: Atualiza as configurações (protegido).
