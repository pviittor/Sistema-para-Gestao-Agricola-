# Back-end GMPR

Este é o back-end do projeto GMPR, construído com Node.js, Express, TypeScript e Sequelize.

## Pré-requisitos

- Node.js instalado

## Instalação

1. Instale as dependências:
```bash
npm install
```

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor em modo de desenvolvimento com hot-reload.
- `npm run build`: Compila o código TypeScript para JavaScript na pasta `dist`.
- `npm start`: Inicia o servidor com o código compilado (produção).

## Estrutura do Projeto

- `src/config`: Configurações (Banco de dados, etc.)
- `src/controllers`: Lógica de controle das requisições
- `src/models`: Modelos do Sequelize
- `src/routes`: Definição das rotas da API
- `src/app.ts`: Configuração do App Express
- `src/server.ts`: Ponto de entrada do servidor

## Banco de Dados

O projeto utiliza **MariaDB**.

### Configuração

1. Certifique-se de ter um servidor MariaDB rodando. Você pode usar o Docker Compose incluído:
   ```bash
   docker-compose up -d
   ```
2. Configure as variáveis de ambiente no arquivo `.env` (baseado no `.env.example`).

## Exemplo de Uso

O projeto vem com uma rota de exemplo para usuários:

- `GET /api/users`: Lista todos os usuários
- `POST /api/users`: Cria um novo usuário (JSON body: `{ "name": "Nome", "email": "email@teste.com" }`)
