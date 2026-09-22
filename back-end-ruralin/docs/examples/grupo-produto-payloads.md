# Payloads de Exemplo - API GrupoProduto

Este documento contém exemplos de payloads JSON para testar todos os endpoints da API de GrupoProduto.

## Autenticação

Todos os endpoints (exceto login) requerem autenticação via Bearer Token:

```
Authorization: Bearer {seu_token_jwt}
```

---

## POST /api/gruposProduto

Cria um novo grupo de produto.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Payloads de Exemplo

#### 1. Grupo completo com abreviação
```json
{
  "descricao_grupo": "Cereais e Grãos",
  "abreviacao_grupo": "CG"
}
```

#### 2. Grupo com abreviação longa
```json
{
  "descricao_grupo": "Fertilizantes e Defensivos Agrícolas",
  "abreviacao_grupo": "FERTDEF"
}
```

#### 3. Grupo mínimo (sem abreviação)
```json
{
  "descricao_grupo": "Sementes"
}
```

#### 4. Grupo com descrição mínima (3 caracteres)
```json
{
  "descricao_grupo": "Soj",
  "abreviacao_grupo": "S"
}
```

#### 5. Grupo com abreviação mínima (1 caractere)
```json
{
  "descricao_grupo": "Fertilizantes",
  "abreviacao_grupo": "F"
}
```

### Resposta de Sucesso (201 Created)
```json
{
  "id": 1,
  "tenantId": 1,
  "descricao_grupo": "Cereais e Grãos",
  "abreviacao_grupo": "CG",
  "createdAt": "2026-01-16T20:30:00.000Z",
  "updatedAt": "2026-01-16T20:30:00.000Z"
}
```

---

## PUT /api/gruposProduto/:id

Atualiza um grupo de produto existente.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Payloads de Exemplo

#### 1. Atualizar apenas descrição
```json
{
  "descricao_grupo": "Cereais e Grãos Atualizado"
}
```

#### 2. Atualizar apenas abreviação
```json
{
  "abreviacao_grupo": "CGA"
}
```

#### 3. Atualizar ambos os campos
```json
{
  "descricao_grupo": "Cereais, Grãos e Sementes",
  "abreviacao_grupo": "CGS"
}
```

#### 4. Remover abreviação (enviar null)
```json
{
  "abreviacao_grupo": null
}
```

### Resposta de Sucesso (200 OK)
```json
{
  "id": 1,
  "tenantId": 1,
  "descricao_grupo": "Cereais e Grãos Atualizado",
  "abreviacao_grupo": "CGA",
  "createdAt": "2026-01-16T20:30:00.000Z",
  "updatedAt": "2026-01-16T20:35:00.000Z"
}
```

---

## GET /api/gruposProduto

Lista grupos de produto com paginação.

### Headers
```
Authorization: Bearer {token}
```

### Query Parameters
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Limite de registros por página (padrão: 10)

### Exemplos de URLs

#### 1. Primeira página com 10 registros
```
GET /api/gruposProduto?page=1&limit=10
```

#### 2. Segunda página com 20 registros
```
GET /api/gruposProduto?page=2&limit=20
```

#### 3. Sem parâmetros (usa padrões)
```
GET /api/gruposProduto
```

### Resposta de Sucesso (200 OK)
```json
{
  "data": [
    {
      "id": 1,
      "tenantId": 1,
      "descricao_grupo": "Cereais e Grãos",
      "abreviacao_grupo": "CG",
      "createdAt": "2026-01-16T20:30:00.000Z",
      "updatedAt": "2026-01-16T20:30:00.000Z"
    },
    {
      "id": 2,
      "tenantId": 1,
      "descricao_grupo": "Fertilizantes",
      "abreviacao_grupo": "FERT",
      "createdAt": "2026-01-16T20:31:00.000Z",
      "updatedAt": "2026-01-16T20:31:00.000Z"
    }
  ],
  "total": 2,
  "page": 1,
  "limit": 10
}
```

---

## GET /api/gruposProduto/:id

Busca um grupo de produto específico por ID.

### Headers
```
Authorization: Bearer {token}
```

### Exemplos de URLs

#### 1. Buscar grupo com ID 1
```
GET /api/gruposProduto/1
```

#### 2. Buscar grupo com ID 10
```
GET /api/gruposProduto/10
```

### Resposta de Sucesso (200 OK)
```json
{
  "id": 1,
  "tenantId": 1,
  "descricao_grupo": "Cereais e Grãos",
  "abreviacao_grupo": "CG",
  "createdAt": "2026-01-16T20:30:00.000Z",
  "updatedAt": "2026-01-16T20:30:00.000Z"
}
```

### Resposta de Erro (404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Grupo de produto não encontrado"
  }
}
```

---

## DELETE /api/gruposProduto/:id

Remove um grupo de produto.

### Headers
```
Authorization: Bearer {token}
```

### Exemplos de URLs

#### 1. Remover grupo com ID 1
```
DELETE /api/gruposProduto/1
```

### Resposta de Sucesso (204 No Content)
Sem corpo de resposta.

### Resposta de Erro (404 Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Grupo de produto não encontrado"
  }
}
```

---

## Validações

### Campo: descricao_grupo
- **Obrigatório**: Sim
- **Tipo**: string
- **Tamanho mínimo**: 3 caracteres
- **Tamanho máximo**: 255 caracteres

### Campo: abreviacao_grupo
- **Obrigatório**: Não
- **Tipo**: string
- **Tamanho mínimo**: 1 caractere (se fornecido)
- **Tamanho máximo**: 50 caracteres

---

## Exemplos de Erros de Validação

### 1. Descrição vazia
**Payload:**
```json
{
  "descricao_grupo": ""
}
```

**Resposta (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos: Descrição é obrigatória",
    "details": [
      {
        "field": "descricao_grupo",
        "message": "Descrição é obrigatória",
        "constraints": {
          "isNotEmpty": "Descrição é obrigatória",
          "minLength": "Descrição deve ter no mínimo 3 caracteres"
        }
      }
    ]
  }
}
```

### 2. Descrição muito curta
**Payload:**
```json
{
  "descricao_grupo": "AB"
}
```

**Resposta (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos: Descrição deve ter no mínimo 3 caracteres",
    "details": [
      {
        "field": "descricao_grupo",
        "message": "Descrição deve ter no mínimo 3 caracteres"
      }
    ]
  }
}
```

### 3. Abreviação muito longa
**Payload:**
```json
{
  "descricao_grupo": "Grupo Válido",
  "abreviacao_grupo": "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ"
}
```

**Resposta (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos: Abreviação deve ter no máximo 50 caracteres",
    "details": [
      {
        "field": "abreviacao_grupo",
        "message": "Abreviação deve ter no máximo 50 caracteres"
      }
    ]
  }
}
```

---

## Exemplos de Uso com cURL

### Criar grupo de produto
```bash
curl -X POST http://localhost:3000/api/gruposProduto \
  -H "Authorization: Bearer {seu_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao_grupo": "Cereais e Grãos",
    "abreviacao_grupo": "CG"
  }'
```

### Listar grupos de produto
```bash
curl -X GET "http://localhost:3000/api/gruposProduto?page=1&limit=10" \
  -H "Authorization: Bearer {seu_token}"
```

### Buscar grupo por ID
```bash
curl -X GET http://localhost:3000/api/gruposProduto/1 \
  -H "Authorization: Bearer {seu_token}"
```

### Atualizar grupo de produto
```bash
curl -X PUT http://localhost:3000/api/gruposProduto/1 \
  -H "Authorization: Bearer {seu_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "descricao_grupo": "Cereais e Grãos Atualizado",
    "abreviacao_grupo": "CGA"
  }'
```

### Remover grupo de produto
```bash
curl -X DELETE http://localhost:3000/api/gruposProduto/1 \
  -H "Authorization: Bearer {seu_token}"
```

---

## Exemplos de Uso com Postman

### Collection JSON para importar no Postman

```json
{
  "info": {
    "name": "GrupoProduto API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Criar Grupo de Produto",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"descricao_grupo\": \"Cereais e Grãos\",\n  \"abreviacao_grupo\": \"CG\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/gruposProduto",
          "host": ["{{base_url}}"],
          "path": ["api", "gruposProduto"]
        }
      }
    },
    {
      "name": "Listar Grupos de Produto",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/gruposProduto?page=1&limit=10",
          "host": ["{{base_url}}"],
          "path": ["api", "gruposProduto"],
          "query": [
            {
              "key": "page",
              "value": "1"
            },
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    }
  ]
}
```

---

## Notas Importantes

1. **Multi-tenancy**: Todos os grupos de produto são automaticamente filtrados pelo `tenantId` do usuário autenticado.

2. **Permissões necessárias**:
   - `grupoProduto.create` - Para criar grupos
   - `grupoProduto.read` - Para listar e buscar grupos
   - `grupoProduto.update` - Para atualizar grupos
   - `grupoProduto.delete` - Para remover grupos

3. **Cache**: As operações de leitura são cacheadas por 1 hora (3600 segundos).

4. **Auditoria**: Todas as operações de criação, atualização e remoção são auditadas automaticamente.
