# Unit of Work - Documentação

## Visão Geral

O **Unit of Work** é um padrão de design que garante atomicidade de operações de banco de dados. Este módulo implementa o padrão Unit of Work para gerenciar transações automaticamente, garantindo que todas as operações sejam commitadas ou revertidas juntas.

## Características

- ✅ **Transações Automáticas**: Cria e gerencia transações automaticamente
- ✅ **Commit Automático**: Faz commit automaticamente em sucesso
- ✅ **Rollback Automático**: Faz rollback automaticamente em caso de erro
- ✅ **Decorator @Transactional**: Aplica transações automaticamente em métodos
- ✅ **Integração com DI**: Totalmente integrado com Dependency Injection
- ✅ **Type-Safe**: Totalmente tipado com TypeScript

## Componentes

### 1. IUnitOfWork

Interface que define o contrato para Unit of Work:

```typescript
export interface IUnitOfWork {
  execute<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T>;
}
```

### 2. UnitOfWorkService

Implementação do Unit of Work Service que gerencia transações usando Sequelize.

### 3. @Transactional

Decorator que aplica transações automaticamente em métodos de Application Services.

## Uso Básico

### Usando UnitOfWork Manualmente

```typescript
import { IUnitOfWork } from '../../../core/unitofwork/IUnitOfWork';
import { TYPES } from '../../../core/di/types';
import { Inject, Injectable } from '../../../core/di';

@Injectable()
export class UsuarioApplicationService {
  constructor(
    @Inject(TYPES.IUsuarioRepository)
    private repository: IUsuarioRepository,
    @Inject(TYPES.IUnitOfWork)
    private unitOfWork: IUnitOfWork
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    return await this.unitOfWork.execute(async (transaction) => {
      // Todas as operações dentro desta função serão transacionais
      const entity = await this.mapper.toEntity(dto);
      const created = await this.repository.create(entity as any, { transaction });
      return this.mapper.toDto(created);
    });
  }
}
```

### Usando @Transactional Decorator

```typescript
import { Transactional } from '../../../core/unitofwork/Transactional';
import { Inject, Injectable } from '../../../core/di';

@Injectable()
export class UsuarioApplicationService {
  constructor(
    @Inject(TYPES.IUsuarioRepository)
    private repository: IUsuarioRepository
  ) {}

  @Transactional()
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Método executado automaticamente dentro de transação
    const entity = await this.mapper.toEntity(dto);
    const created = await this.repository.create(entity as any);
    return this.mapper.toDto(created);
  }
}
```

## Quando Usar

### Use @Transactional quando:

- ✅ Método modifica dados (create, update, delete)
- ✅ Método executa múltiplas operações que devem ser atômicas
- ✅ Método precisa garantir consistência de dados
- ✅ Método tem validações que devem ser revertidas se criação falhar

### Não use @Transactional quando:

- ❌ Método apenas lê dados (getById, list, findBy*)
- ❌ Método não acessa banco de dados
- ❌ Método já está dentro de uma transação maior

## Exemplos Práticos

### Exemplo 1: Criação Simples

```typescript
@Transactional()
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  // Validação (dentro de transação)
  const existing = await this.repository.findByEmail(dto.email);
  if (existing) {
    throw new BusinessException('Email já está em uso');
  }

  // Criação (dentro de transação)
  const entity = await this.mapper.toEntity(dto);
  const created = await this.repository.create(entity as any);
  return this.mapper.toDto(created);
}
```

**Benefício**: Se a criação falhar após a validação, nada é commitado.

### Exemplo 2: Múltiplas Operações

```typescript
@Transactional()
async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
  // Todas as operações são atômicas
  const usuario = await this.usuarioRepository.create(dto);
  const role = await this.roleRepository.create({ nome: 'USER' });
  await this.usuarioRoleRepository.create({
    usuarioId: usuario.id,
    roleId: role.id
  });
  return this.mapper.toDto(usuario);
}
```

**Benefício**: Se qualquer operação falhar, todas são revertidas.

### Exemplo 3: Atualização com Validações

```typescript
@Transactional()
async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
  // Verificação (dentro de transação)
  const existing = await this.repository.findById(id);
  if (!existing) {
    throw new NotFoundException('Usuário', id);
  }

  // Validação (dentro de transação)
  if (dto.email && dto.email !== existing.email) {
    const emailExists = await this.repository.findByEmail(dto.email);
    if (emailExists) {
      throw new BusinessException('Email já está em uso');
    }
  }

  // Atualização (dentro de transação)
  const entity = await this.mapper.toEntity(dto);
  const updated = await this.repository.update(id, entity as any);
  return this.mapper.toDto(updated);
}
```

**Benefício**: Validações e atualização são atômicas.

## Boas Práticas

### 1. Aplicar em Métodos que Modificam Dados

```typescript
// ✅ Correto
@Transactional()
async create(dto: CreateDto): Promise<ResponseDto> {
  // ...
}

@Transactional()
async update(id: number, dto: UpdateDto): Promise<ResponseDto> {
  // ...
}

@Transactional()
async delete(id: number): Promise<boolean> {
  // ...
}

// ❌ Incorreto - método de leitura não precisa de transação
@Transactional()
async getById(id: number): Promise<ResponseDto | null> {
  // ...
}
```

### 2. Não Aplicar em Métodos de Leitura

```typescript
// ✅ Correto - sem @Transactional
async getById(id: number): Promise<ResponseDto | null> {
  const entity = await this.repository.findById(id);
  return entity ? this.mapper.toDto(entity) : null;
}

async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ResponseDto>> {
  const result = await this.repository.findAllPaginated(page, limit);
  return {
    ...result,
    data: result.data.map(entity => this.mapper.toDto(entity)),
  };
}
```

### 3. Manter Validações Dentro da Transação

```typescript
// ✅ Correto - validações dentro da transação
@Transactional()
async create(dto: CreateDto): Promise<ResponseDto> {
  // Validação dentro da transação
  const existing = await this.repository.findByEmail(dto.email);
  if (existing) {
    throw new BusinessException('Email já está em uso');
  }

  // Criação dentro da transação
  const created = await this.repository.create(dto);
  return this.mapper.toDto(created);
}
```

### 4. Usar Exceções para Rollback

```typescript
// ✅ Correto - exceção causa rollback automático
@Transactional()
async create(dto: CreateDto): Promise<ResponseDto> {
  if (dto.valor < 0) {
    throw new BusinessException('Valor não pode ser negativo');
  }
  // Se exceção for lançada, rollback automático
  return await this.repository.create(dto);
}
```

## Troubleshooting

### Problema: Transação não está funcionando

**Solução**: Verifique se:
1. O decorator `@Transactional()` está aplicado corretamente
2. O método é assíncrono (`async`)
3. O `UnitOfWorkService` está registrado no DI container

### Problema: Rollback não está acontecendo

**Solução**: Certifique-se de que:
1. As exceções estão sendo lançadas (não capturadas silenciosamente)
2. O erro está sendo propagado (não está sendo capturado e ignorado)

### Problema: Transação muito lenta

**Solução**: 
1. Verifique se há operações desnecessárias dentro da transação
2. Considere mover validações simples para fora da transação
3. Use índices adequados no banco de dados

## Integração com Application Services

Todos os Application Services devem usar `@Transactional` em métodos que modificam dados:

```typescript
@Injectable()
export class UsuarioApplicationService {
  @Transactional()
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // ...
  }

  @Transactional()
  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    // ...
  }

  @Transactional()
  async delete(id: number): Promise<boolean> {
    // ...
  }

  // Sem @Transactional (apenas leitura)
  async getById(id: number): Promise<UsuarioResponseDto | null> {
    // ...
  }
}
```

## Referências

- [T10.1 - UnitOfWork Service](../documentos/features/T10.1-UnitOfWork-Service.md)
- [T10.2 - Decorator de Transação](../documentos/features/T10.2-Decorator-Transacao.md)
- [T10.3 - Integração com Application Services](../documentos/features/T10.3-Integracao-Application-Services.md)
- [Sequelize Transactions](https://sequelize.org/docs/v6/other-topics/transactions/)
- [Unit of Work Pattern](https://martinfowler.com/eaaCatalog/unitOfWork.html)

## Arquivos Relacionados

- `IUnitOfWork.ts` - Interface do Unit of Work
- `UnitOfWorkService.ts` - Implementação do serviço
- `Transactional.ts` - Decorator para aplicar transações
- `index.ts` - Barrel exports
