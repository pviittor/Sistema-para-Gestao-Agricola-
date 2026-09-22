# Application Services - Documentação de Padrões

## Visão Geral

Application Services são responsáveis por conter a **lógica de negócio** da aplicação, separando controllers (camada HTTP) da lógica de aplicação. Eles seguem os princípios de **Clean Architecture** e **Domain-Driven Design (DDD)**.

## Estrutura de Diretórios

```
src/application/services/
├── IApplicationService.ts          # Interface genérica
├── BaseApplicationService.ts        # Classe base opcional
├── README.md                        # Esta documentação
├── index.ts                         # Barrel export
└── [entity]/                        # Services específicos (futuro)
    └── [Entity]ApplicationService.ts
```

## Padrões e Convenções

### Nomenclatura

- **Interface**: `I[Entity]ApplicationService`
- **Classe**: `[Entity]ApplicationService`
- **Arquivo**: `[Entity]ApplicationService.ts`

**Exemplos**:
- `IUsuarioApplicationService` / `UsuarioApplicationService`
- `IEventoApplicationService` / `EventoApplicationService`
- `IFinanceiroApplicationService` / `FinanceiroApplicationService`

### Métodos Padrão

Todos os Application Services devem implementar os seguintes métodos (definidos em `IApplicationService`):

1. **`create(dto: TCreateDto): Promise<TDto>`**
   - Cria uma nova entidade
   - Valida dados de entrada
   - Aplica regras de negócio
   - Retorna DTO da entidade criada

2. **`update(id: number, dto: TUpdateDto): Promise<TDto>`**
   - Atualiza uma entidade existente
   - Valida dados de entrada
   - Aplica regras de negócio
   - Retorna DTO da entidade atualizada

3. **`delete(id: number): Promise<boolean>`**
   - Remove uma entidade
   - Aplica regras de negócio (ex: validações de dependências)
   - Retorna `true` se removido, `false` caso contrário

4. **`getById(id: number): Promise<TDto | null>`**
   - Busca uma entidade por ID
   - Retorna DTO ou `null` se não encontrado

5. **`list(page?: number, limit?: number): Promise<PaginatedResult<TDto>>`**
   - Lista entidades com paginação
   - Retorna resultado paginado com metadados

### Métodos Customizados

Application Services podem adicionar métodos customizados específicos da entidade:

```typescript
interface IUsuarioApplicationService extends IApplicationService<...> {
  findByEmail(email: string): Promise<UsuarioResponseDto | null>;
  findByUsername(username: string): Promise<UsuarioResponseDto | null>;
  assignRole(usuarioId: number, roleId: number): Promise<void>;
}
```

## Retorno de DTOs

**IMPORTANTE**: Application Services devem **sempre retornar DTOs**, nunca entidades do domínio diretamente.

**✅ Correto**:
```typescript
async getById(id: number): Promise<UsuarioResponseDto | null> {
  const usuario = await this.repository.findById(id);
  return usuario ? this.toDto(usuario) : null;
}
```

**❌ Incorreto**:
```typescript
async getById(id: number): Promise<Usuario | null> {
  return await this.repository.findById(id); // Retorna entidade diretamente
}
```

## Mapeamento DTO ↔ Entidade

Application Services devem implementar métodos de mapeamento:

- **`toDto(entity: TEntity): TDto`** - Converte entidade para DTO
- **`toEntity(dto: TCreateDto | TUpdateDto): Partial<TEntity>`** - Converte DTO para entidade

**Exemplo**:
```typescript
protected toDto(entity: Usuario): UsuarioResponseDto {
  return {
    id: entity.id,
    nome: entity.nome,
    email: entity.email,
    // ... outros campos
    // NÃO incluir senha!
  };
}

protected toEntity(dto: CreateUsuarioDto | UpdateUsuarioDto): Partial<Usuario> {
  const entity: any = {
    nome: dto.nome,
    email: dto.email,
    // ...
  };
  
  // Apenas incluir senha se fornecida e não vazia
  if ('senha' in dto && dto.senha) {
    entity.senha = await bcrypt.hash(dto.senha, 10);
  }
  
  return entity;
}
```

## Integração com Repositórios

Application Services devem usar repositórios para acesso a dados:

```typescript
@Injectable()
export class UsuarioApplicationService {
  constructor(
    @Inject(TYPES.IUsuarioRepository)
    private repository: IUsuarioRepository
  ) {}
  
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Lógica de negócio aqui
    const entity = this.toEntity(dto);
    const created = await this.repository.create(entity);
    return this.toDto(created);
  }
}
```

## Lógica de Negócio

Application Services devem conter:

- ✅ Validações de negócio
- ✅ Regras de negócio
- ✅ Orquestração de múltiplos repositórios
- ✅ Transformações de dados
- ✅ Aplicação de políticas

**NÃO devem conter**:
- ❌ Lógica de acesso a dados (deve usar repositórios)
- ❌ Lógica de HTTP (deve estar nos controllers)
- ❌ Lógica de apresentação (deve estar nos DTOs)

## Exemplo Completo

```typescript
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { IUsuarioRepository } from '../../infrastructure/repository/IUsuarioRepository';
import { IUsuarioApplicationService } from './IUsuarioApplicationService';
import { CreateUsuarioDto } from '../dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto } from '../dto/usuario/UsuarioResponseDto';
import { NotFoundException, BusinessException } from '../../core/exceptions';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsuarioApplicationService implements IUsuarioApplicationService {
  constructor(
    @Inject(TYPES.IUsuarioRepository)
    private repository: IUsuarioRepository
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Validação de negócio
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new BusinessException('Email já está em uso');
    }

    // Transformação de dados
    const entity = this.toEntity(dto);
    
    // Criação via repositório
    const created = await this.repository.create(entity);
    
    // Retorno como DTO
    return this.toDto(created);
  }

  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException('Usuário', id);
    }

    // Validação de negócio
    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.repository.findByEmail(dto.email);
      if (emailExists) {
        throw new BusinessException('Email já está em uso');
      }
    }

    const entity = this.toEntity(dto);
    const updated = await this.repository.update(id, entity);
    return this.toDto(updated);
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      return false;
    }

    // Validação de dependências (exemplo)
    // if (existing.hasRelatedData()) {
    //   throw new BusinessException('Não é possível remover usuário com dados relacionados');
    // }

    return await this.repository.delete(id);
  }

  async getById(id: number): Promise<UsuarioResponseDto | null> {
    const entity = await this.repository.findById(id);
    return entity ? this.toDto(entity) : null;
  }

  async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<UsuarioResponseDto>> {
    const result = await this.repository.findAllPaginated(page, limit);
    return {
      ...result,
      data: result.data.map(entity => this.toDto(entity)),
    };
  }

  // Métodos customizados
  async findByEmail(email: string): Promise<UsuarioResponseDto | null> {
    const entity = await this.repository.findByEmail(email);
    return entity ? this.toDto(entity) : null;
  }

  // Métodos privados de mapeamento
  private toDto(entity: Usuario): UsuarioResponseDto {
    return {
      id: entity.id,
      nome: entity.nome,
      email: entity.email,
      username: entity.username,
      // ... outros campos
      // NÃO incluir senha!
    };
  }

  private toEntity(dto: CreateUsuarioDto | UpdateUsuarioDto): Partial<Usuario> {
    const entity: any = {
      nome: dto.nome,
      email: dto.email,
      // ... outros campos
    };

    // Hash de senha apenas se fornecida
    if ('senha' in dto && dto.senha) {
      entity.senha = await bcrypt.hash(dto.senha, 10);
    }

    return entity;
  }
}
```

## Integração com DI Container

Application Services devem ser registrados no DI container:

```typescript
// src/core/di/registerServices.ts
import { UsuarioApplicationService } from '../../application/services/usuario/UsuarioApplicationService';

export function registerServices(): void {
  container.registerSingleton(
    TYPES.IUsuarioApplicationService,
    UsuarioApplicationService
  );
}
```

## Uso em Controllers

Controllers devem usar Application Services ao invés de repositórios diretamente:

```typescript
@Injectable()
export class UsuarioController {
  constructor(
    @Inject(TYPES.IUsuarioApplicationService)
    private usuarioService: IUsuarioApplicationService
  ) {}

  async create(req: Request, res: Response) {
    const dto = req.body as CreateUsuarioDto;
    const usuario = await this.usuarioService.create(dto);
    return res.status(201).json(usuario);
  }
}
```

## Testes

Application Services devem ser testados isoladamente, mockando repositórios:

```typescript
describe('UsuarioApplicationService', () => {
  let service: UsuarioApplicationService;
  let mockRepository: jest.Mocked<IUsuarioRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      // ...
    } as any;

    service = new UsuarioApplicationService(mockRepository);
  });

  it('deve criar usuário com sucesso', async () => {
    const dto: CreateUsuarioDto = { /* ... */ };
    const mockUsuario = { /* ... */ } as Usuario;
    
    mockRepository.create.mockResolvedValue(mockUsuario);

    const result = await service.create(dto);

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });
});
```

## Benefícios

1. **Separação de Responsabilidades**: Controllers focam em HTTP, Services em lógica de negócio
2. **Reutilização**: Lógica de negócio pode ser reutilizada em diferentes contextos
3. **Testabilidade**: Fácil testar lógica de negócio isoladamente
4. **Manutenibilidade**: Código mais organizado e fácil de manter
5. **Flexibilidade**: Fácil adicionar novas regras de negócio sem modificar controllers

## Próximos Passos

1. Implementar Application Services específicos (T7.3, T8.1, etc.)
2. Implementar sistema de mapeamento DTOs-Entidades (T7.2)
3. Refatorar controllers para usar Application Services
4. Implementar Unit of Work para transações (T7.4)

---

**Última Atualização**: 14/01/2025
