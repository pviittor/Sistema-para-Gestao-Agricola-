# Script de Teste - GrupoProduto API

Este script testa todas as operações CRUD da API de GrupoProduto.

## Pré-requisitos

- Node.js 18+ (com suporte nativo ao `fetch`)
- Servidor da API rodando
- Usuário válido no banco de dados para autenticação

## Como usar

### Execução básica

```bash
npm run test:grupo-produto
```

ou

```bash
ts-node scripts/test-grupo-produto.ts
```

### Configuração via variáveis de ambiente

Você pode configurar as seguintes variáveis de ambiente:

```bash
# URL da API (padrão: http://localhost:3000)
API_URL=http://localhost:3000

# Credenciais de login (padrão: admin@example.com / admin123)
LOGIN_EMAIL=admin@example.com
LOGIN_PASSWORD=admin123
```

### Exemplo com variáveis de ambiente

```bash
API_URL=http://localhost:3000 LOGIN_EMAIL=usuario@example.com LOGIN_PASSWORD=senha123 npm run test:grupo-produto
```

## O que o script faz

1. **Login**: Autentica na API e obtém o token JWT
2. **Lista**: Busca todos os grupos de produto (GET `/api/gruposProduto`)
3. **Cria**: Cria um novo grupo de produto (POST `/api/gruposProduto`)
4. **Lista novamente**: Verifica se o novo grupo foi criado
5. **Atualiza**: Atualiza o grupo criado (PUT `/api/gruposProduto/:id`)
6. **Lista novamente**: Verifica se a atualização foi aplicada
7. **Remove**: Remove o grupo criado (DELETE `/api/gruposProduto/:id`)
8. **Lista final**: Confirma que o grupo foi removido

## Estrutura de saída

O script exibe informações detalhadas sobre cada operação:

```
🚀 Iniciando testes da API de GrupoProduto
============================================================

🔐 Fazendo login...
   Email: admin@example.com
   URL: http://localhost:3000/api/auth/login
✅ Login realizado com sucesso!
   Usuário: Admin (admin@example.com)
   Token obtido: eyJhbGciOiJIUzI1NiIs...

📋 Listando grupos de produto...
   URL: http://localhost:3000/api/gruposProduto
✅ 0 grupo(s) de produto encontrado(s)

➕ Criando novo grupo de produto...
   ...
```

## Tratamento de erros

- Se qualquer operação falhar, o script tenta limpar o grupo criado (se existir)
- Mensagens de erro detalhadas são exibidas
- O script retorna código de saída 1 em caso de erro

## Permissões necessárias

O usuário usado para login deve ter as seguintes permissões:

- `grupoProduto.create`
- `grupoProduto.read`
- `grupoProduto.update`
- `grupoProduto.delete`

## Notas

- O script cria um grupo de produto com nome único baseado em timestamp
- O grupo criado é sempre removido ao final (mesmo em caso de erro)
- O script usa `fetch` nativo do Node.js (requer Node.js 18+)
