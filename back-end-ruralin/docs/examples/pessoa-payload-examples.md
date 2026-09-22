# Exemplos de Payloads para CreatePessoaDto

Este documento contém exemplos de payloads JSON para testar o endpoint `POST /api/pessoas`.

## 1. Pessoa Física (PF) - Exemplo Completo

```json
{
  "nomerazao_pessoa": "João Silva",
  "cpfcnpj_pessoa": "12345678901",
  "tipo_pessoa": 1,
  "nascimento_pessoa": "1990-05-15",
  "email_pessoa": "joao.silva@example.com",
  "identidade_pessoa": "1234567",
  "orgaoidentidade_pessoa": "SSP",
  "telefone1_pessoa": "(11) 98765-4321",
  "endereco_pessoa": "Rua das Flores, 123",
  "bairro_pessoa": "Centro",
  "numero_pessoa": "123",
  "cep_pessoa": "01234-567",
  "complemento_pessoa": "Apto 45",
  "cliente_pessoa": true,
  "produtor_pessoa": false,
  "portador_pessoa": false,
  "funcionario_pessoa": false,
  "fornecedor_pessoa": false,
  "motorista_pessoa": false,
  "operador_pessoa": false,
  "contato_pessoa": "João Silva",
  "observacao_pessoa": "Cliente preferencial"
}
```

## 2. Pessoa Jurídica (PJ) - Exemplo Completo

```json
{
  "nomerazao_pessoa": "Empresa ABC Ltda",
  "nomefantasia_pessoa": "ABC Comércio",
  "cpfcnpj_pessoa": "12345678000190",
  "tipo_pessoa": 2,
  "nascimento_pessoa": "2010-03-20",
  "email_pessoa": "contato@abc.com.br",
  "telefone1_pessoa": "(11) 3456-7890",
  "endereco_pessoa": "Av. Paulista, 1000",
  "bairro_pessoa": "Bela Vista",
  "numero_pessoa": "1000",
  "cep_pessoa": "01310-100",
  "complemento_pessoa": "Sala 501",
  "inscricaoEstadual_pessoa": "123.456.789.012",
  "inscricaoMunicipal_pessoa": "987654321",
  "cliente_pessoa": true,
  "produtor_pessoa": true,
  "portador_pessoa": false,
  "funcionario_pessoa": false,
  "fornecedor_pessoa": true,
  "motorista_pessoa": false,
  "operador_pessoa": false,
  "contato_pessoa": "Maria Santos",
  "observacao_pessoa": "Fornecedor certificado"
}
```

## 3. Pessoa Física - Mínimo (Apenas Campos Obrigatórios)

```json
{
  "tipo_pessoa": 1,
  "nomerazao_pessoa": "Maria Oliveira",
  "cpfcnpj_pessoa": "98765432100"
}
```

## 4. Pessoa Jurídica - Mínimo (Apenas Campos Obrigatórios)

```json
{
  "tipo_pessoa": 2,
  "nomerazao_pessoa": "XYZ Indústria S.A.",
  "nomefantasia_pessoa": "XYZ",
  "cpfcnpj_pessoa": "98765432000111"
}
```

## 5. Pessoa Física com Múltiplos Papéis

```json
{
  "nomerazao_pessoa": "Carlos Eduardo Santos",
  "cpfcnpj_pessoa": "11122233344",
  "tipo_pessoa": 1,
  "nascimento_pessoa": "1985-12-25",
  "email_pessoa": "carlos.santos@example.com",
  "identidade_pessoa": "9876543",
  "orgaoidentidade_pessoa": "SSP-SP",
  "telefone1_pessoa": "(11) 3333-4444",
  "endereco_pessoa": "Rua dos Trabalhadores, 500",
  "bairro_pessoa": "Vila Operária",
  "numero_pessoa": "500",
  "cep_pessoa": "04567-890",
  "complemento_pessoa": "Bloco B, Apto 101",
  "cliente_pessoa": true,
  "produtor_pessoa": true,
  "portador_pessoa": false,
  "funcionario_pessoa": true,
  "fornecedor_pessoa": false,
  "motorista_pessoa": true,
  "operador_pessoa": false,
  "observacao_pessoa": "Funcionário desde 2020. Motorista habilitado categoria D."
}
```

## 6. Pessoa Jurídica - Fornecedor

```json
{
  "nomerazao_pessoa": "Agropecuária São João S.A.",
  "nomefantasia_pessoa": "Agro São João",
  "cpfcnpj_pessoa": "11223344000155",
  "tipo_pessoa": 2,
  "nascimento_pessoa": "2005-01-10",
  "email_pessoa": "vendas@agrosaojoao.com.br",
  "telefone1_pessoa": "(19) 3456-7890",
  "endereco_pessoa": "Rodovia SP-348, Km 120",
  "bairro_pessoa": "Zona Rural",
  "numero_pessoa": "S/N",
  "cep_pessoa": "13800-000",
  "inscricaoEstadual_pessoa": "123.456.789.012",
  "inscricaoMunicipal_pessoa": "987654321",
  "cliente_pessoa": false,
  "produtor_pessoa": true,
  "portador_pessoa": false,
  "funcionario_pessoa": false,
  "fornecedor_pessoa": true,
  "motorista_pessoa": false,
  "operador_pessoa": false,
  "contato_pessoa": "José da Silva",
  "observacao_pessoa": "Fornecedor de grãos e cereais"
}
```

## Notas Importantes

- **Campo obrigatório**: `tipo_pessoa` (1 = PF, 2 = PJ)
- **CPF/CNPJ**: Deve ser único no sistema
- **CEP**: Formato obrigatório: `00000-000` (com hífen)
- **Email**: Deve ser um email válido
- **Data de nascimento**: Formato `YYYY-MM-DD`
- **Campos booleanos**: Todos têm valor padrão `false` se não informados
- **Campos opcionais**: Podem ser omitidos do payload

## Testando com cURL

### Pessoa Física:
```bash
curl -X POST http://localhost:3000/api/pessoas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "nomerazao_pessoa": "João Silva",
    "cpfcnpj_pessoa": "12345678901",
    "tipo_pessoa": 1,
    "email_pessoa": "joao.silva@example.com",
    "cliente_pessoa": true
  }'
```

### Pessoa Jurídica:
```bash
curl -X POST http://localhost:3000/api/pessoas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "nomerazao_pessoa": "Empresa ABC Ltda",
    "nomefantasia_pessoa": "ABC Comércio",
    "cpfcnpj_pessoa": "12345678000190",
    "tipo_pessoa": 2,
    "email_pessoa": "contato@abc.com.br",
    "cliente_pessoa": true,
    "fornecedor_pessoa": true
  }'
```
