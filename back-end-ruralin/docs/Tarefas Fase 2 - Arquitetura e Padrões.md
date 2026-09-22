# Tarefas Detalhadas - Fase 2: Arquitetura e Padrões

## Formato de Ticket

Cada tarefa abaixo pode ser copiada diretamente para criação de tickets em ferramentas de gestão (Jira, Trello, GitHub Issues, etc.).

**Template de Ticket**:
- **Título**: [ID] - [Nome da Tarefa]
- **Tipo**: Task/Feature/Refactoring
- **Prioridade**: P0/P1/P2/P3
- **Story Points**: X
- **Sprint**: X
- **Descrição**: [Conteúdo abaixo]
- **Critérios de Aceite**: [Lista abaixo]
- **Dependências**: [Listadas abaixo]

---

## FASE 2: ARQUITETURA E PADRÕES

### SPRINT 5: Repository Pattern - Base

---

#### T5.1 - Interface IRepository

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 5  
**Estimativa**: 20 horas

**Descrição**:
Criar interface genérica IRepository<T> que define o contrato para todos os repositórios do sistema, abstraindo o acesso a dados e facilitando testes e manutenção.

**Contexto Técnico**:
- Atualmente os controllers acessam diretamente os modelos Sequelize
- Interface genérica permite trocar implementação sem afetar código que a utiliza
- Facilita criação de mocks para testes
- Define padrão consistente para todos os repositórios

**Tarefas Específicas**:
1. Criar interface `IRepository<T>` em `src/core/repository/IRepository.ts`
2. Definir métodos base CRUD:
   - `findById(id: number | string): Promise<T | null>`
   - `findAll(options?: FindOptions): Promise<T[]>`
   - `create(entity: Partial<T>): Promise<T>`
   - `update(id: number | string, entity: Partial<T>): Promise<T>`
   - `delete(id: number | string): Promise<boolean>`
3. Definir métodos de query:
   - `findOne(options: FindOptions): Promise<T | null>`
   - `findMany(options: FindOptions): Promise<T[]>`
4. Definir métodos de paginação:
   - `findAllPaginated(page: number, limit: number, options?: FindOptions): Promise<PaginatedResult<T>>`
5. Criar tipos auxiliares (FindOptions, PaginatedResult)
6. Documentar interface

**Código de Referência**:
```typescript
// src/core/repository/IRepository.ts
export interface FindOptions {
  where?: Record<string, any>;
  include?: any[];
  order?: [string, 'ASC' | 'DESC'][];
  attributes?: string[];
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IRepository<T> {
  findById(id: number | string): Promise<T | null>;
  findAll(options?: FindOptions): Promise<T[]>;
  findOne(options: FindOptions): Promise<T | null>;
  findMany(options: FindOptions): Promise<T[]>;
  findAllPaginated(
    page: number,
    limit: number,
    options?: FindOptions
  ): Promise<PaginatedResult<T>>;
  create(entity: Partial<T>): Promise<T>;
  update(id: number | string, entity: Partial<T>): Promise<T>;
  delete(id: number | string): Promise<boolean>;
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] Interface IRepository criada e documentada
- [ ] Todos os métodos base definidos
- [ ] Tipos auxiliares criados
- [ ] Documentação completa
- [ ] Interface exportada corretamente

**Arquivos a Criar**:
- `src/core/repository/IRepository.ts`
- `src/core/repository/types.ts`

---

#### T5.2 - BaseRepository

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 5  
**Estimativa**: 32 horas

**Descrição**:
Implementar classe abstrata BaseRepository que fornece implementação padrão dos métodos da interface IRepository usando Sequelize.

**Contexto Técnico**:
- BaseRepository será estendida por repositórios específicos
- Implementa lógica comum para todos os repositórios
- Integra com Sequelize para acesso a dados
- Tratamento de erros padronizado

**Tarefas Específicas**:
1. Criar classe abstrata `BaseRepository<T>` em `src/core/repository/BaseRepository.ts`
2. Implementar métodos CRUD base usando Sequelize
3. Implementar paginação
4. Implementar tratamento de erros (mapear para exceções customizadas)
5. Integrar com DI container
6. Escrever testes unitários
7. Documentar uso

**Código de Referência**:
```typescript
// src/core/repository/BaseRepository.ts
import { Model, ModelCtor } from 'sequelize';
import { injectable } from 'tsyringe';
import { IRepository, FindOptions, PaginatedResult } from './IRepository';

@injectable()
export abstract class BaseRepository<T extends Model> implements IRepository<T> {
  protected model: ModelCtor<T>;

  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  async findById(id: number | string): Promise<T | null> {
    return await this.model.findByPk(id);
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return await this.model.findAll({
      where: options?.where,
      include: options?.include,
      order: options?.order,
      attributes: options?.attributes
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    options?: FindOptions
  ): Promise<PaginatedResult<T>> {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.model.findAndCountAll({
      where: options?.where,
      include: options?.include,
      order: options?.order,
      attributes: options?.attributes,
      limit,
      offset
    });

    return {
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  async create(entity: Partial<T>): Promise<T> {
    return await this.model.create(entity as any);
  }

  async update(id: number | string, entity: Partial<T>): Promise<T> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException(this.model.name, id);
    }
    await instance.update(entity);
    return instance;
  }

  async delete(id: number | string): Promise<boolean> {
    const instance = await this.findById(id);
    if (!instance) {
      return false;
    }
    await instance.destroy();
    return true;
  }
}
```

**Dependências**:
- T5.1 (Interface IRepository)
- T2.1 (Classes de Exceção Customizadas)

**Critérios de Aceite**:
- [ ] BaseRepository implementado e funcionando
- [ ] Todos os métodos da interface implementados
- [ ] Paginação funcionando corretamente
- [ ] Tratamento de erros implementado
- [ ] Integrado com DI
- [ ] Testes unitários passando (>80% cobertura)
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/repository/BaseRepository.ts`
- `src/core/repository/BaseRepository.spec.ts`

---

#### T5.3 - UsuarioRepository

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 5  
**Estimativa**: 20 horas

**Descrição**:
Criar repositório específico para Usuario estendendo BaseRepository e implementando métodos customizados específicos da entidade.

**Contexto Técnico**:
- UsuarioRepository será usado pelos Application Services
- Métodos específicos como findByEmail e findByUsername são necessários
- Serve como exemplo para outros repositórios

**Tarefas Específicas**:
1. Criar `UsuarioRepository` em `src/infrastructure/repository/UsuarioRepository.ts`
2. Estender `BaseRepository<Usuario>`
3. Implementar método `findByEmail(email: string): Promise<Usuario | null>`
4. Implementar método `findByUsername(username: string): Promise<Usuario | null>`
5. Registrar no DI container
6. Escrever testes unitários

**Código de Referência**:
```typescript
// src/infrastructure/repository/UsuarioRepository.ts
import { injectable } from 'tsyringe';
import { BaseRepository } from '../../core/repository/BaseRepository';
import Usuario from '../../models/Usuario';

@injectable()
export class UsuarioRepository extends BaseRepository<Usuario> {
  constructor() {
    super(Usuario);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.model.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return await this.model.findOne({ where: { username } });
  }
}
```

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] UsuarioRepository criado e funcionando
- [ ] Métodos específicos implementados
- [ ] Registrado no DI container
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/infrastructure/repository/UsuarioRepository.ts`
- `src/infrastructure/repository/UsuarioRepository.spec.ts`

---

#### T5.4 - Refatoração de AuthController

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 5  
**Estimativa**: 12 horas

**Descrição**:
Refatorar AuthController para usar UsuarioRepository ao invés de acesso direto ao modelo Sequelize.

**Tarefas Específicas**:
1. Injetar UsuarioRepository no AuthController
2. Substituir `Usuario.findOne()` por `usuarioRepository.findByEmail()`
3. Remover import direto do modelo Usuario
4. Atualizar testes de integração
5. Validar que autenticação continua funcionando

**Dependências**:
- T5.3 (UsuarioRepository)

**Critérios de Aceite**:
- [ ] AuthController refatorado para usar repositório
- [ ] Acesso direto ao Sequelize removido
- [ ] Testes de integração passando
- [ ] Autenticação funcionando corretamente
- [ ] Nenhuma regressão

**Arquivos a Modificar**:
- `src/controllers/AuthController.ts`

---

### SPRINT 6: Repository Pattern - Entidades Principais

---

#### T6.1 - EventoRepository

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 6  
**Estimativa**: 12 horas

**Descrição**:
Criar repositório para entidade Evento com métodos específicos.

**Tarefas Específicas**:
1. Criar `EventoRepository` estendendo BaseRepository
2. Implementar `findByLocal(localId: number): Promise<Evento[]>`
3. Implementar `findByData(dataInicio: Date, dataFim: Date): Promise<Evento[]>`
4. Registrar no DI container
5. Escrever testes unitários

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] EventoRepository criado e funcionando
- [ ] Métodos específicos implementados
- [ ] Testes passando
- [ ] Registrado no DI

---

#### T6.2 - FinanceiroRepository

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 6  
**Estimativa**: 12 horas

**Descrição**:
Criar repositório para entidade Financeiro com métodos específicos.

**Tarefas Específicas**:
1. Criar `FinanceiroRepository` estendendo BaseRepository
2. Implementar `findByPeriodo(dataInicio: Date, dataFim: Date): Promise<Financeiro[]>`
3. Implementar `findByTipo(tipo: string): Promise<Financeiro[]>`
4. Registrar no DI container
5. Escrever testes unitários

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] FinanceiroRepository criado e funcionando
- [ ] Métodos específicos implementados
- [ ] Testes passando
- [ ] Registrado no DI

---

#### T6.3 - LembreteRepository

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 6  
**Estimativa**: 12 horas

**Descrição**:
Criar repositório para entidade Lembrete com métodos específicos.

**Tarefas Específicas**:
1. Criar `LembreteRepository` estendendo BaseRepository
2. Implementar `findByUsuario(usuarioId: number): Promise<Lembrete[]>`
3. Implementar `findProximos(limite: number): Promise<Lembrete[]>`
4. Registrar no DI container
5. Escrever testes unitários

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] LembreteRepository criado e funcionando
- [ ] Métodos específicos implementados
- [ ] Testes passando
- [ ] Registrado no DI

---

#### T6.4 - LocalRepository

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 6  
**Estimativa**: 12 horas

**Descrição**:
Criar repositório para entidade Local com métodos específicos.

**Tarefas Específicas**:
1. Criar `LocalRepository` estendendo BaseRepository
2. Implementar `findByUsuario(usuarioId: number): Promise<Local[]>`
3. Registrar no DI container
4. Escrever testes unitários

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] LocalRepository criado e funcionando
- [ ] Métodos específicos implementados
- [ ] Testes passando
- [ ] Registrado no DI

---

#### T6.5 - RoleRepository e PermissaoRepository

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 6  
**Estimativa**: 20 horas

**Descrição**:
Criar repositórios para Role e Permissao.

**Tarefas Específicas**:
1. Criar `RoleRepository` estendendo BaseRepository
2. Criar `PermissaoRepository` estendendo BaseRepository
3. Implementar métodos específicos conforme necessário
4. Registrar ambos no DI container
5. Escrever testes unitários

**Dependências**:
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] RoleRepository criado e funcionando
- [ ] PermissaoRepository criado e funcionando
- [ ] Testes passando
- [ ] Registrados no DI

---

#### T6.6 - Refatoração de Controllers

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 6  
**Estimativa**: 32 horas

**Descrição**:
Refatorar todos os controllers restantes para usar repositórios ao invés de acesso direto ao Sequelize.

**Tarefas Específicas**:
1. Refatorar EventoController para usar EventoRepository
2. Refatorar FinanceiroController para usar FinanceiroRepository
3. Refatorar LembreteController para usar LembreteRepository
4. Refatorar LocalController para usar LocalRepository
5. Refatorar RoleController e PermissaoController
6. Remover imports diretos dos modelos
7. Atualizar testes de integração
8. Validar que todas as rotas continuam funcionando

**Dependências**:
- T6.1 a T6.5 (Todos os repositórios)

**Critérios de Aceite**:
- [ ] Todos os controllers refatorados
- [ ] Acesso direto ao Sequelize removido
- [ ] Testes de integração passando
- [ ] Nenhuma regressão
- [ ] API funcionando corretamente

**Arquivos a Modificar**:
- `src/controllers/EventoController.ts`
- `src/controllers/FinanceiroController.ts`
- `src/controllers/LembreteController.ts`
- `src/controllers/LocalController.ts`
- `src/controllers/RoleController.ts`
- `src/controllers/PermissaoController.ts`

---

### SPRINT 7: Application Services - Estrutura Base

---

#### T7.1 - Estrutura de Application Services

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 7  
**Estimativa**: 20 horas

**Descrição**:
Criar estrutura base para Application Services, definindo interfaces, classe base e padrões de uso.

**Contexto Técnico**:
- Application Services contêm a lógica de negócio
- Separam controllers (HTTP) da lógica de aplicação
- Facilitam testes e reutilização
- Seguem princípios de Clean Architecture

**Tarefas Específicas**:
1. Criar estrutura de pastas: `src/application/services/`
2. Criar interface `IApplicationService` (opcional, para padronização)
3. Criar classe base `ApplicationService` (opcional)
4. Definir padrões e convenções:
   - Nomenclatura: `[Entity]ApplicationService`
   - Métodos: `create`, `update`, `delete`, `getById`, `list`
   - Retornar DTOs, não entidades
5. Documentar padrões

**Código de Referência**:
```typescript
// src/application/services/IApplicationService.ts
export interface IApplicationService<TDto, TCreateDto, TUpdateDto> {
  create(dto: TCreateDto): Promise<TDto>;
  update(id: number, dto: TUpdateDto): Promise<TDto>;
  delete(id: number): Promise<boolean>;
  getById(id: number): Promise<TDto | null>;
  list(page?: number, limit?: number): Promise<PaginatedResult<TDto>>;
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] Estrutura de pastas criada
- [ ] Interfaces/classe base definidas
- [ ] Padrões documentados
- [ ] Documentação completa

**Arquivos a Criar**:
- `src/application/services/IApplicationService.ts`
- `src/application/services/README.md`

---

#### T7.2 - Mapeamento DTOs-Entidades

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 7  
**Estimativa**: 20 horas

**Descrição**:
Criar sistema de mapeamento entre DTOs e entidades do domínio.

**Contexto Técnico**:
- Application Services trabalham com DTOs
- Repositórios trabalham com entidades
- Mappers fazem a conversão entre as duas camadas
- Mantém separação de responsabilidades

**Tarefas Específicas**:
1. Criar estrutura de mappers: `src/application/mappers/`
2. Criar interface `IMapper<TEntity, TDto>`
3. Criar `UsuarioMapper`:
   - `toEntity(dto: CreateUsuarioDto | UpdateUsuarioDto): Partial<Usuario>`
   - `toDto(entity: Usuario): UsuarioResponseDto`
4. Criar mapper genérico base (opcional)
5. Escrever testes unitários

**Código de Referência**:
```typescript
// src/application/mappers/UsuarioMapper.ts
import { CreateUsuarioDto, UpdateUsuarioDto, UsuarioResponseDto } from '../dto';
import Usuario from '../../models/Usuario';

export class UsuarioMapper {
  static toEntity(dto: CreateUsuarioDto | UpdateUsuarioDto): Partial<Usuario> {
    return {
      nome: dto.nome,
      email: dto.email,
      username: dto.username,
      // Não incluir senha aqui - será tratado separadamente
    };
  }

  static toDto(entity: Usuario): UsuarioResponseDto {
    return {
      id: entity.id,
      nome: entity.nome,
      email: entity.email,
      username: entity.username,
      tipo: entity.tipo,
      // Nunca incluir senha no DTO
    };
  }
}
```

**Dependências**:
- T3.4 (DTOs de Usuário)

**Critérios de Aceite**:
- [ ] Estrutura de mappers criada
- [ ] UsuarioMapper implementado
- [ ] Métodos toEntity e toDto funcionando
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/application/mappers/UsuarioMapper.ts`
- `src/application/mappers/UsuarioMapper.spec.ts`

---

#### T7.3 - UsuarioApplicationService

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 7  
**Estimativa**: 32 horas

**Descrição**:
Criar Application Service completo para Usuario com todos os métodos CRUD e lógica de negócio.

**Tarefas Específicas**:
1. Criar `UsuarioApplicationService` em `src/application/services/UsuarioApplicationService.ts`
2. Implementar `create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto>`
   - Validar regras de negócio
   - Hash da senha
   - Mapear DTO para entidade
   - Salvar via repositório
   - Retornar DTO
3. Implementar `update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto>`
4. Implementar `delete(id: number): Promise<boolean>`
5. Implementar `getById(id: number): Promise<UsuarioResponseDto | null>`
6. Implementar `list(page: number, limit: number): Promise<PaginatedResult<UsuarioResponseDto>>`
7. Integrar com UsuarioRepository
8. Integrar com DI
9. Escrever testes unitários

**Código de Referência**:
```typescript
// src/application/services/UsuarioApplicationService.ts
import { injectable, inject } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { UsuarioRepository } from '../../infrastructure/repository/UsuarioRepository';
import { CreateUsuarioDto, UpdateUsuarioDto, UsuarioResponseDto } from '../dto';
import { UsuarioMapper } from '../mappers/UsuarioMapper';
import { NotFoundException } from '../../core/exceptions';

@injectable()
export class UsuarioApplicationService {
  constructor(
    @inject('IUsuarioRepository') private repository: UsuarioRepository
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Validações de negócio
    const existingUser = await this.repository.findByEmail(dto.email);
    if (existingUser) {
      throw new BusinessException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    // Mapear e criar
    const entity = UsuarioMapper.toEntity(dto);
    const created = await this.repository.create({
      ...entity,
      senha: hashedPassword
    } as any);

    return UsuarioMapper.toDto(created);
  }

  async getById(id: number): Promise<UsuarioResponseDto | null> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      return null;
    }
    return UsuarioMapper.toDto(entity);
  }

  // Implementar outros métodos...
}
```

**Dependências**:
- T7.1 (Estrutura de Application Services)
- T7.2 (Mapeamento DTOs-Entidades)
- T5.3 (UsuarioRepository)

**Critérios de Aceite**:
- [ ] UsuarioApplicationService criado e funcionando
- [ ] Todos os métodos CRUD implementados
- [ ] Lógica de negócio implementada
- [ ] Integrado com repositório
- [ ] Integrado com DI
- [ ] Testes unitários passando (>80% cobertura)
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/application/services/UsuarioApplicationService.ts`
- `src/application/services/UsuarioApplicationService.spec.ts`

---

#### T7.4 - Refatoração de UsuarioController

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 7  
**Estimativa**: 12 horas

**Descrição**:
Refatorar UsuarioController para usar UsuarioApplicationService, simplificando a lógica do controller.

**Tarefas Específicas**:
1. Injetar UsuarioApplicationService no UsuarioController
2. Substituir lógica de negócio por chamadas ao service
3. Controller deve apenas:
   - Receber requisição HTTP
   - Chamar Application Service
   - Retornar resposta HTTP
4. Atualizar testes de integração
5. Validar que API continua funcionando

**Código de Referência**:
```typescript
// Antes
class UsuarioController {
  async create(req: Request, res: Response) {
    // Lógica de negócio aqui
    const user = await Usuario.create({...});
    // ...
  }
}

// Depois
@Injectable()
class UsuarioController {
  constructor(
    @Inject('IUsuarioApplicationService') 
    private service: UsuarioApplicationService
  ) {}

  async create(req: Request, res: Response) {
    const dto = req.body as CreateUsuarioDto;
    const result = await this.service.create(dto);
    return res.status(201).json(result);
  }
}
```

**Dependências**:
- T7.3 (UsuarioApplicationService)

**Critérios de Aceite**:
- [ ] UsuarioController refatorado
- [ ] Lógica de negócio removida do controller
- [ ] Controller apenas orquestra chamadas
- [ ] Testes de integração passando
- [ ] API funcionando corretamente
- [ ] Nenhuma regressão

**Arquivos a Modificar**:
- `src/controllers/UsuarioController.ts`

---

### SPRINT 8: Application Services - Entidades Principais

---

#### T8.1 - EventoApplicationService

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 8  
**Estimativa**: 32 horas

**Descrição**:
Criar Application Service completo para Evento com todos os métodos CRUD e lógica de negócio específica.

**Tarefas Específicas**:
1. Criar `EventoMapper` (seguindo padrão do UsuarioMapper)
2. Criar `EventoApplicationService`
3. Implementar todos os métodos CRUD
4. Implementar lógica de negócio específica (validações de datas, relacionamentos)
5. Integrar com EventoRepository
6. Escrever testes unitários
7. Refatorar EventoController para usar o service

**Dependências**:
- T7.2 (Mapeamento DTOs-Entidades)
- T6.1 (EventoRepository)
- T4.1 (DTOs de Evento)

**Critérios de Aceite**:
- [ ] EventoApplicationService criado e funcionando
- [ ] Todos os métodos CRUD implementados
- [ ] Lógica de negócio implementada
- [ ] Testes passando
- [ ] EventoController refatorado
- [ ] API funcionando

---

#### T8.2 - FinanceiroApplicationService

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 8  
**Estimativa**: 32 horas

**Descrição**:
Criar Application Service completo para Financeiro com cálculos e validações específicas.

**Tarefas Específicas**:
1. Criar `FinanceiroMapper`
2. Criar `FinanceiroApplicationService`
3. Implementar todos os métodos CRUD
4. Implementar lógica de negócio (cálculos, validações de valores)
5. Integrar com FinanceiroRepository
6. Escrever testes unitários
7. Refatorar FinanceiroController

**Dependências**:
- T7.2 (Mapeamento DTOs-Entidades)
- T6.2 (FinanceiroRepository)
- T4.2 (DTOs de Financeiro)

**Critérios de Aceite**:
- [ ] FinanceiroApplicationService criado e funcionando
- [ ] Cálculos e validações implementados
- [ ] Testes passando
- [ ] FinanceiroController refatorado
- [ ] API funcionando

---

#### T8.3 - LembreteApplicationService

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 8  
**Estimativa**: 20 horas

**Descrição**:
Criar Application Service para Lembrete.

**Tarefas Específicas**:
1. Criar `LembreteMapper`
2. Criar `LembreteApplicationService`
3. Implementar todos os métodos CRUD
4. Implementar lógica de negócio específica
5. Integrar com LembreteRepository
6. Escrever testes
7. Refatorar LembreteController

**Dependências**:
- T7.2 (Mapeamento DTOs-Entidades)
- T6.3 (LembreteRepository)
- T4.3 (DTOs de Lembrete)

**Critérios de Aceite**:
- [ ] LembreteApplicationService criado e funcionando
- [ ] Testes passando
- [ ] LembreteController refatorado
- [ ] API funcionando

---

#### T8.4 - Refatoração de Controllers

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 8  
**Estimativa**: 20 horas

**Descrição**:
Refatorar controllers de Evento, Financeiro e Lembrete para usar Application Services.

**Tarefas Específicas**:
1. Refatorar EventoController
2. Refatorar FinanceiroController
3. Refatorar LembreteController
4. Atualizar testes de integração
5. Validar que todas as rotas funcionam

**Dependências**:
- T8.1, T8.2, T8.3 (Application Services)

**Critérios de Aceite**:
- [ ] Todos os controllers refatorados
- [ ] Testes de integração passando
- [ ] Nenhuma regressão

---

### SPRINT 9: Application Services - Finalização

---

#### T9.1 - LocalApplicationService

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 9  
**Estimativa**: 20 horas

**Descrição**:
Criar Application Service para Local.

**Tarefas Específicas**:
1. Criar `LocalMapper`
2. Criar `LocalApplicationService`
3. Implementar métodos CRUD
4. Integrar com LocalRepository
5. Escrever testes
6. Refatorar LocalController

**Dependências**:
- T7.2 (Mapeamento DTOs-Entidades)
- T6.4 (LocalRepository)
- T4.4 (DTOs de Local)

**Critérios de Aceite**:
- [ ] LocalApplicationService criado e funcionando
- [ ] Testes passando
- [ ] LocalController refatorado
- [ ] API funcionando

---

#### T9.2 - RoleApplicationService e PermissaoApplicationService

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 8  
**Sprint**: 9  
**Estimativa**: 32 horas

**Descrição**:
Criar Application Services para Role e Permissao.

**Tarefas Específicas**:
1. Criar `RoleMapper` e `PermissaoMapper`
2. Criar `RoleApplicationService`
3. Criar `PermissaoApplicationService`
4. Implementar métodos CRUD para ambos
5. Implementar lógica de negócio específica (gerenciamento de permissões)
6. Integrar com repositórios
7. Escrever testes
8. Refatorar controllers

**Dependências**:
- T7.2 (Mapeamento DTOs-Entidades)
- T6.5 (RoleRepository e PermissaoRepository)
- T4.5 (DTOs de Roles e Permissões)

**Critérios de Aceite**:
- [ ] Ambos os services criados e funcionando
- [ ] Lógica de negócio implementada
- [ ] Testes passando
- [ ] Controllers refatorados
- [ ] API funcionando

---

#### T9.3 - Refatoração Final de Controllers

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 9  
**Estimativa**: 20 horas

**Descrição**:
Finalizar refatoração de todos os controllers restantes e controllers de relacionamentos.

**Tarefas Específicas**:
1. Refatorar LocalController
2. Refatorar RoleController e PermissaoController
3. Refatorar controllers de relacionamentos (RoleHasPermissao, UsuarioHasRole, etc.)
4. Atualizar todos os testes de integração
5. Validar que toda a API funciona

**Dependências**:
- T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] Todos os controllers refatorados
- [ ] Testes de integração passando
- [ ] API completa funcionando
- [ ] Nenhuma regressão

---

#### T9.4 - Documentação de Application Services

**Tipo**: Documentation  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 9  
**Estimativa**: 12 horas

**Descrição**:
Criar documentação completa sobre Application Services.

**Tarefas Específicas**:
1. Documentar padrões de Application Services
2. Criar exemplos de uso
3. Documentar boas práticas
4. Criar guia de criação de novos services

**Critérios de Aceite**:
- [ ] Documentação completa criada
- [ ] Exemplos práticos incluídos
- [ ] Guia de boas práticas criado
- [ ] Documentação revisada

---

### SPRINT 10: Unit of Work

---

#### T10.1 - UnitOfWork Service

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 10  
**Estimativa**: 32 horas

**Descrição**:
Implementar serviço UnitOfWork para gerenciar transações de banco de dados automaticamente.

**Contexto Técnico**:
- UnitOfWork garante atomicidade de operações
- Cada método de Application Service é uma unidade de trabalho
- Transações são criadas automaticamente e commitadas ao final
- Rollback automático em caso de erro

**Tarefas Específicas**:
1. Criar interface `IUnitOfWork`:
   ```typescript
   export interface IUnitOfWork {
     execute<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T>;
   }
   ```
2. Implementar `UnitOfWorkService` usando Sequelize transactions
3. Gerenciar transações aninhadas (se necessário)
4. Integrar com DI container
5. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/unitofwork/IUnitOfWork.ts
import { Transaction } from 'sequelize';

export interface IUnitOfWork {
  execute<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T>;
}

// src/core/unitofwork/UnitOfWorkService.ts
import { injectable } from 'tsyringe';
import sequelize from '../../config/database';
import { IUnitOfWork } from './IUnitOfWork';

@injectable()
export class UnitOfWorkService implements IUnitOfWork {
  async execute<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    const transaction = await sequelize.transaction();
    try {
      const result = await fn(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] IUnitOfWork interface criada
- [ ] UnitOfWorkService implementado
- [ ] Transações funcionando corretamente
- [ ] Rollback automático em erros
- [ ] Integrado com DI
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/unitofwork/IUnitOfWork.ts`
- `src/core/unitofwork/UnitOfWorkService.ts`
- `src/core/unitofwork/UnitOfWorkService.spec.ts`

---

#### T10.2 - Decorator de Transação

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 10  
**Estimativa**: 20 horas

**Descrição**:
Criar decorator @Transactional para aplicar transações automaticamente em métodos de Application Services.

**Tarefas Específicas**:
1. Criar decorator `@Transactional`:
   ```typescript
   export function Transactional(options?: TransactionOptions) {
     return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
       // Implementar interceptor
     };
   }
   ```
2. Implementar interceptor que:
   - Captura chamada do método
   - Cria transação
   - Executa método dentro da transação
   - Faz commit ou rollback
3. Suportar configuração de isolamento
4. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/unitofwork/Transactional.ts
import { IUnitOfWork } from './IUnitOfWork';
import { container } from 'tsyringe';

export function Transactional() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const unitOfWork = container.resolve<IUnitOfWork>('IUnitOfWork');
      return await unitOfWork.execute(async (transaction) => {
        // Passar transaction como parâmetro se necessário
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
```

**Dependências**:
- T10.1 (UnitOfWork Service)

**Critérios de Aceite**:
- [ ] Decorator @Transactional criado
- [ ] Interceptor funcionando
- [ ] Transações aplicadas automaticamente
- [ ] Rollback em erros funcionando
- [ ] Testes passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/unitofwork/Transactional.ts`
- `src/core/unitofwork/Transactional.spec.ts`

---

#### T10.3 - Integração com Application Services

**Tipo**: Refactoring  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 10  
**Estimativa**: 20 horas

**Descrição**:
Integrar UnitOfWork com todos os Application Services, aplicando transações onde necessário.

**Tarefas Específicas**:
1. Atualizar Application Services para injetar IUnitOfWork
2. Aplicar @Transactional em métodos que modificam dados
3. Atualizar métodos para usar transações:
   - create, update, delete devem ser transacionais
   - getById, list não precisam de transação
4. Atualizar testes de integração
5. Validar que transações estão funcionando

**Código de Referência**:
```typescript
@Injectable()
export class UsuarioApplicationService {
  constructor(
    @Inject('IUsuarioRepository') private repository: UsuarioRepository,
    @Inject('IUnitOfWork') private unitOfWork: IUnitOfWork
  ) {}

  @Transactional()
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // Método executado dentro de transação
    // ...
  }
}
```

**Dependências**:
- T10.1 (UnitOfWork Service)
- T10.2 (Decorator de Transação)
- T7.3, T8.1, T8.2, T8.3, T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] Todos os Application Services atualizados
- [ ] @Transactional aplicado onde necessário
- [ ] Transações funcionando corretamente
- [ ] Testes de integração passando
- [ ] Rollback testado e funcionando

**Arquivos a Modificar**:
- Todos os Application Services

---

#### T10.4 - Documentação

**Tipo**: Documentation  
**Prioridade**: P1  
**Story Points**: 2  
**Sprint**: 10  
**Estimativa**: 8 horas

**Descrição**:
Criar documentação completa sobre UnitOfWork.

**Tarefas Específicas**:
1. Documentar uso do UnitOfWork
2. Criar exemplos práticos
3. Documentar boas práticas
4. Explicar quando usar @Transactional

**Critérios de Aceite**:
- [ ] Documentação completa criada
- [ ] Exemplos práticos incluídos
- [ ] Boas práticas documentadas
- [ ] Documentação revisada

---

## RESUMO DA FASE 2

### Objetivos Alcançados

- ✅ Repository Pattern implementado
- ✅ Application Services criados para todas as entidades
- ✅ Separação de responsabilidades (Controllers → Services → Repositories)
- ✅ UnitOfWork implementado para transações
- ✅ Código mais testável e manutenível

### Métricas Esperadas

- **Cobertura de Testes**: > 80% em repositórios e services
- **Redução de Código Duplicado**: ~40% nos controllers
- **Tempo de Desenvolvimento**: Aumento de 30% na velocidade após padronização
- **Bugs**: Redução de 50% após implementação

### Próximos Passos

Após conclusão da Fase 2, seguir para:
- **Fase 3**: Segurança e Auditoria (Authorization Declarativa, Audit Logging)
- **Fase 4**: Performance e Escalabilidade (Caching, Multi Tenancy)

---

**Última Atualização**: [Data]  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
