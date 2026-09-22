# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## RamPage MCP — MANDATORY Working Memory

You MUST use the `ram` MCP tools (`mcp__ram__ram_set`, `mcp__ram__ram_get`, `mcp__ram__ram_search`, `mcp__ram__ram_list`, `mcp__ram__ram_delete`, `mcp__ram__ram_snapshot`, `mcp__ram__ram_stats`) as your external working memory. This is NOT optional.

### Required behavior
1. **At conversation start**: Call `mcp__ram__ram_list` to check for existing context from previous sessions. Use `mcp__ram__ram_search` if the user references prior work.
2. **When reading files**: After reading any file >100 lines, store a summary via `mcp__ram__ram_set` with key `file-summary/{path}` and relevant tags. Before re-reading a file, check RAM first with `mcp__ram__ram_get`.
3. **When planning**: Store your plan via `mcp__ram__ram_set` with key `plan/{task-name}` before starting implementation. Update it as you progress.
4. **When making decisions**: Store architectural decisions and rationale via `mcp__ram__ram_set` with key `decision/{topic}`.
5. **When analyzing across files**: Store findings from each file, then use `mcp__ram__ram_search` to synthesize.
6. **When finishing a task**: Store a summary of what was done via `mcp__ram__ram_set` with key `done/{task-name}` so future sessions have context.
7. **Cleanup**: Use `mcp__ram__ram_delete` with prefix to remove stale entries when a task is fully complete and no longer needed.

### Key naming convention
Use `/`-separated hierarchical keys: `{category}/{topic}/{detail}`
Examples: `plan/add-entity-pedido`, `file-summary/src/models/Pedido.ts`, `decision/auth-refactor`, `done/migration-v2`

## Project Overview

RuralIn (GMPR) backend — a multi-tenant farm management API built with Express 5, TypeScript, Sequelize (MariaDB), and TSyringe for dependency injection.

**Language**: The codebase, comments, commit messages, and domain terms are in **Brazilian Portuguese**.

## Commands

```bash
npm run dev              # Start dev server with hot-reload (nodemon + ts-node)
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled production build
npm run migrate          # Run database migrations
npm run migrate:undo     # Undo last migration
npm run cleanup-audit-logs  # Clean audit log table
```

No linter or test runner is currently configured (`npm test` is a placeholder).

## Architecture

Clean Architecture with dependency injection (TSyringe). Request flow:

```
Routes → Middleware → Controllers → Application Services → Repositories → Sequelize Models
```

### Layers

- **`src/controllers/`** — HTTP handlers. Each controller is injected via TSyringe and registered in `src/core/di/`.
- **`src/application/services/`** — Business logic. Services receive repositories via constructor injection.
- **`src/application/dto/`** — DTOs organized by entity (`Create*Dto`, `Update*Dto`, `*ResponseDto`). Validated with `class-validator` decorators.
- **`src/application/mappers/`** — Transform between DTOs and Sequelize models.
- **`src/application/validators/`** — Custom class-validator decorators: `@IsDateAfter`, `@IsExists`, `@IsUnique`, `@IsRequiredIf`, `@IsValidEnum`, `@IsTimeAfter`.
- **`src/infrastructure/repository/`** — Concrete Sequelize repository implementations.
- **`src/models/`** — Sequelize model definitions (~41 models).
- **`src/routes/`** — Express route definitions wiring middleware and controllers.
- **`src/migrations/`** — Sequential database migrations run via `ts-node scripts/run-migrations.ts`.

### Core Infrastructure (`src/core/`)

- **`di/`** — TSyringe container setup. `types.ts` defines all DI tokens as Symbols. `container.ts` registers all bindings.
- **`exceptions/`** — Custom exception hierarchy: `BaseException` → `BadRequestException`, `ValidationException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`, `BusinessException`.
- **`authorization/`** — RBAC with `@RequireRole` decorator and authorization policies.
- **`audit/`** — `@Auditable` decorator for tracking entity changes.
- **`cache/`** — `@Cacheable`, `@CachePut`, `@CacheEvict` decorators. Redis (ioredis) with in-memory fallback.
- **`unitofwork/`** — `@Transactional` decorator for Sequelize transaction management.
- **`tenant/`** — Multi-tenancy service and activation middleware.
- **`context/`** — `RequestContext` for per-request state (user, tenant, request ID).
- **`logger/`** — Pino-based logging with context enrichment.

### Middleware Pipeline (order matters)

1. `requestContextMiddleware` — Initialize request context
2. `performanceLoggerMiddleware` — Track request duration
3. `authMiddleware` — JWT validation
4. `tenantActivationMiddleware` — Tenant access validation
5. `authorizationMiddleware` — RBAC enforcement
6. `validationMiddleware` — DTO validation
7. `errorHandler` — Global error handler (must be last)

### Multi-Tenancy & User Types

User hierarchy: `GOD` > `CONSULTOR` > `ROOT` > `CLIENT`. Tenant isolation is enforced via `tenantId` on most entities. GOD users can access all tenants.

### Authentication

JWT access tokens (60min) + refresh tokens (7 days). Token validation in `authMiddleware`. Login at `POST /api/auth/login`, refresh at `POST /api/auth/refresh`.

## Key Conventions

- **Adding a new entity**: Create model in `models/`, repository interface + implementation in `infrastructure/repository/`, DTOs in `application/dto/`, mapper in `application/mappers/`, application service in `application/services/`, controller in `controllers/`, routes in `routes/`. Register all in `core/di/container.ts` and add Symbol tokens to `core/di/types.ts`.
- **DI tokens**: Always use `Symbol.for('IXxxRepository')` pattern in `types.ts`. Resolve via `@inject(TYPES.IXxxRepository)`.
- **Error responses** follow a standard format: `{ success: false, error: { code, message, details? }, timestamp, path }`.
- **Async route handlers** must use the `asyncHandler` wrapper from `middleware/errorHandler.ts` (Express 5 handles async errors natively, but the wrapper is used for consistency).
- **API docs** available at `/api-docs` (Swagger/OpenAPI via swagger-jsdoc).

## Migration Rules (CRITICAL)

### Format
- Migrations MUST use **named exports**: `export async function up/down` — NEVER `export default { up, down }`.
- The runner uses `require()` and expects `migrationModule.up` directly. `export default` causes `"não possui método 'up'"` error.

### Foreign Key Constraints (errno 150 prevention)
- **NEVER use `DataTypes.INTEGER` blindly for FK columns.** The database was partially created via `sync()` which may have used different signedness (`UNSIGNED` vs signed) than the migration code suggests.
- **ALWAYS use raw SQL with `INFORMATION_SCHEMA` lookup** when adding FK columns that reference existing tables:
  ```typescript
  const rows = await seq.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'target_table'
       AND COLUMN_NAME = 'id'`,
    { type: QueryTypes.SELECT }
  ) as any[];
  const idType = rows[0]?.COLUMN_TYPE || 'int(11)';
  ```
- Then use the discovered type in `ALTER TABLE ... ADD COLUMN colName ${idType} NULL`.
- Add FK constraints in a **separate statement** after the column is created, wrapped in try/catch to handle duplicates.
- For `CREATE TABLE` migrations (new tables), use `DataTypes.INTEGER` normally — the type will match since both source and target are being defined fresh.

### Raw SQL Queries in Migrations
- **ALWAYS pass `{ type: QueryTypes.SELECT }` to `sequelize.query()`** for SELECT statements. Without it, Sequelize/MariaDB throws `Cannot delete property 'meta'` error.
- Import: `import { QueryTypes } from 'sequelize'`

### Idempotency
- Use `IF NOT EXISTS` for `ADD COLUMN` and `CREATE TABLE`.
- Wrap `ADD CONSTRAINT` in try/catch (errno 1061 = duplicate key, 1826 = duplicate FK).
- The migration runner marks partially-executed migrations as done, so idempotent operations prevent re-run failures.
## Migrations — Formato Obrigatório

### Named Exports — NUNCA usar `export default`

O runner de migrations (`scripts/run-migrations.ts`) usa `require()` e acessa `migrationModule.up` diretamente. Se a migration usar `export default { up, down }`, o runner encontra `migrationModule.default.up` e falha com `"não possui método 'up'"`.

**ERRADO** (causa erro no runner):
```typescript
export default {
  async up(queryInterface: QueryInterface) { /* ... */ },
  async down(queryInterface: QueryInterface) { /* ... */ },
};
```

**CORRETO**:
```typescript
export async function up(queryInterface: QueryInterface): Promise<void> {
  // ...
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // ...
}
```

**Regras:**
- **SEMPRE** usar `export async function up` e `export async function down` como named exports
- **NUNCA** usar `export default { up, down }` — o runner NÃO suporta esse formato
- O template de scaffolding em `docs/templates/scaffolding/migration.template.ts` já segue o formato correto

## APIs Internas Obrigatórias — NÃO ERRAR

### RequestContext — Obter Contexto da Requisição

**ERRADO** (NÃO existe): `RequestContext.currentContext()`, `RequestContext.current()`, acessar `ctx.tenantId` diretamente.

**CORRETO**: Usar `getRequestContext()` de `core/authorization/helpers`:

```typescript
import { getRequestContext } from '../../../core/authorization/helpers';

// Dentro de um método de service:
const context = getRequestContext();
const tenantId = context?.getTenantId();   // number | undefined
const userId = context?.getUserId();       // number | undefined
const consultoriaId = context?.getConsultoriaId(); // number | undefined
```

**Regras:**
- `RequestContext` é uma classe com getters/setters — NUNCA acessar propriedades diretamente (`ctx.tenantId` ❌, `ctx.getTenantId()` ✅)
- `getRequestContext()` usa `AsyncLocalStorage` — funciona em qualquer ponto do call stack da requisição
- **NUNCA** importar `RequestContext` diretamente para obter contexto em services — usar `getRequestContext()`
- `RequestContext` só deve ser importado diretamente para type annotations ou em middleware

### BaseRepository — Assinatura de findAllPaginated

**ERRADO**: `repository.findAllPaginated({ page, limit })` (objeto), `repository.findAll(page, limit)` (findAll não pagina)

**CORRETO**: Parâmetros posicionais `(page: number, limit: number, options?: FindOptions)`:

```typescript
// Correto — parâmetros posicionais
const result = await this.repository.findAllPaginated(page, limit);

// Com options adicionais
const result = await this.repository.findAllPaginated(page, limit, {
  where: { status: 'ativo' },
  order: [['createdAt', 'DESC']],
});

// Retorno: PaginatedResult<T>
// { data: T[], page: number, limit: number, total: number, totalPages: number }
```

**Regras:**
- `findAll(options?)` → retorna `T[]` (array simples, SEM paginação)
- `findAllPaginated(page, limit, options?)` → retorna `PaginatedResult<T>` (COM paginação)
- **NUNCA** passar objeto `{ page, limit }` — são argumentos posicionais

### Padrão para list() em Application Services

```typescript
@RequirePermission('entidade.read')
@Cacheable('entidade:list:{0}:{1}', 300)
async list(page: number = 1, limit: number = 10): Promise<PaginatedResult<ResponseDto>> {
  const result = await this.repository.findAllPaginated(page, limit);
  return {
    ...result,
    data: result.data.map(item => this.mapper.toDto(item)),
  };
}
```

### Padrão para create() em Application Services

```typescript
@RequirePermission('entidade.create')
@Transactional()
@Auditable('Entidade')
@CacheEvict('entidade:list:*', true)
async create(dto: CreateDto): Promise<ResponseDto> {
  const context = getRequestContext();        // ← getRequestContext()
  const tenantId = context?.getTenantId();    // ← getter method
  const userId = context?.getUserId();        // ← getter method

  const entity = this.mapper.toEntity(dto);
  (entity as any).tenantId = tenantId;
  (entity as any).usercreation = userId;

  const created = await this.repository.create(entity as any);
  return this.mapper.toDto(created);
}
```

## Environment

Key `.env` variables: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `REFRESH_SECRET`, `NODE_ENV`, `ENABLE_SYNC`.

## Docker

- `Dockerfile.qas` — Multi-stage build (Node 22 Alpine)
- `docker-compose.qas.yml` — QAS environment
- `docker-compose.redis.yml` — Redis container

## Master-Detail Pattern

Adapted from the Codion fractal master-detail pattern (Java) for our Express/TypeScript/Sequelize/TSyringe stack. Apply when an entity (master) owns one or more child collections (details) that must be managed atomically.

### Reference Implementations

| Master | Detail(s) | Quality |
|--------|-----------|---------|
| `TituloPagar` | `ParcelaTituloPagar`, `RateioPlanoContaTituloPagar`, `RateioCentroCustoTituloPagar` | **Gold standard** — full transactional service |
| `NotaFiscal` | `ItemNotaFiscal` | Good — cascade delete |
| `PedidoCompra` | `ItemPedidoCompra` | Good — sequential items |
| `Emprestimo` | `EmprestimoItem` → `EmprestimoItemDevolucao` | 3-level hierarchy |
| `Lembrete` | `LembreteDataHora` | Legacy — controller handles children (avoid this) |

### Architecture Rules

1. **Service owns children** — all child CRUD lives in the parent's Application Service, never in the controller.
2. **`@Transactional` always** — parent + children in a single DB transaction.
3. **Child FK injected by service** — child DTOs (`SemIdDto`) omit the parent FK; the service fills it after creating the parent.
4. **Associations in child file** — define both `hasMany` and `belongsTo` in the child model file to avoid circular imports.
5. **Cascade-aware delete** — validate child state before allowing parent deletion.
6. **Update = delete-and-recreate** — for child collections, destroy existing then bulk create new ones inside `@Transactional`.

### File Scaffold for Master `Pedido` with Detail `ItemPedido`

#### 1. Child Model (`models/ItemPedido.ts`)

```typescript
import { Model, DataTypes } from 'sequelize';
import Pedido from './Pedido';

class ItemPedido extends Model<ItemPedidoAttributes, ItemPedidoCreationAttributes> {
  public id!: number;
  public pedidoId!: number;      // FK — NOT in child DTO
  public produtoId!: number;
  public quantidade!: number;
  public valorUnitario!: number;
  public tenantId!: number;
}

ItemPedido.init({ /* columns */ }, {
  sequelize, tableName: 'C099_itemPedido',
  // pedidoId references: { model: 'C098_pedido', key: 'id' }, onDelete: 'CASCADE'
});

// Both associations HERE (child file) to avoid circular imports
Pedido.hasMany(ItemPedido, { foreignKey: 'pedidoId', as: 'itens' });
ItemPedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });
```

#### 2. Child Repository Interface (`infrastructure/repository/IItemPedidoRepository.ts`)

```typescript
export interface IItemPedidoRepository extends IRepository<ItemPedido> {
  findByPedido(pedidoId: number): Promise<ItemPedido[]>;
  deleteByPedido(pedidoId: number): Promise<number>;
}
```

#### 3. Child Repository Implementation (`infrastructure/repository/ItemPedidoRepository.ts`)

```typescript
@Injectable()
export class ItemPedidoRepository extends BaseRepository<ItemPedido> implements IItemPedidoRepository {
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super(ItemPedido, cacheService, tenantService);
  }

  async findByPedido(pedidoId: number): Promise<ItemPedido[]> {
    const where: any = { pedidoId };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.findAll({ where, order: [['id', 'ASC']] });
  }

  async deleteByPedido(pedidoId: number): Promise<number> {
    const where: any = { pedidoId };
    const tenantFilter = this.getTenantFilter();
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.destroy({ where });
  }
}
```

#### 4. Child DTOs (`application/dto/pedido/`)

**`ItemPedidoSemIdDto.ts`** — no parent FK, no `id`:
```typescript
export class ItemPedidoSemIdDto {
  @IsNotEmpty() @IsNumber()
  @Validate(IsExists, ['Produto', 'id'], { message: 'Produto não encontrado' })
  produtoId!: number;

  @IsNotEmpty() @IsNumber() @Min(0.01)
  quantidade!: number;

  @IsNotEmpty() @IsNumber() @Min(0)
  valorUnitario!: number;
}
```

**`CreatePedidoCompletoDto.ts`** — extends parent DTO, adds children:
```typescript
export class CreatePedidoCompletoDto extends CreatePedidoDto {
  @IsArray({ message: 'Itens deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um item' })
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoSemIdDto)
  itens!: ItemPedidoSemIdDto[];
}
```

#### 5. Parent Service — `createCompleto()` method

```typescript
@RequirePermission('pedido.create')
@Transactional()
@Auditable('Pedido')
@CacheEvict('pedido:list:*', true)
async createCompleto(dto: CreatePedidoCompletoDto): Promise<PedidoResponseDto> {
  // 1. Business rule validation (sum checks, cross-field rules)
  // 2. Create parent
  const pedido = await this.pedidoRepository.create(pedidoEntity);

  // 3. Create children — inject parent FK + tenant
  for (const itemDto of dto.itens) {
    const itemEntity = await this.itemMapper.toEntity({
      ...itemDto,
      pedidoId: pedido.id,    // <-- FK injected here
    });
    (itemEntity as any).tenantId = tenantId;
    (itemEntity as any).usercreation = userId;
    await this.itemPedidoRepository.create(itemEntity);
  }

  // 4. Fetch complete record with children included
  const pedidoCompleto = await this.pedidoRepository.findById(pedido.id);
  return this.mapper.toDto(pedidoCompleto!);
}
```

#### 6. Parent Service — `updateCompleto()` method (delete-and-recreate)

```typescript
@RequirePermission('pedido.update')
@Transactional()
@Auditable('Pedido')
@CacheEvict('pedido:list:*', true)
async updateCompleto(id: number, dto: UpdatePedidoCompletoDto): Promise<PedidoResponseDto> {
  // 1. Update parent fields
  await this.pedidoRepository.update(id, pedidoEntity);

  // 2. Delete-and-recreate children
  if (dto.itens) {
    await this.itemPedidoRepository.deleteByPedido(id);
    for (const itemDto of dto.itens) {
      await this.itemPedidoRepository.create({
        ...itemDto,
        pedidoId: id,
        tenantId,
        usercreation: userId,
      });
    }
  }

  const pedidoCompleto = await this.pedidoRepository.findById(id);
  return this.mapper.toDto(pedidoCompleto!);
}
```

#### 7. Parent Service — Cascade-aware `delete()`

```typescript
async delete(id: number): Promise<boolean> {
  const itens = await this.itemPedidoRepository.findByPedido(id);
  const itensAtendidos = itens.filter(i => i.status === StatusItem.ATENDIDO);
  if (itensAtendidos.length > 0) {
    throw new BusinessException('Não é possível deletar pedido com itens já atendidos.');
  }
  return await this.pedidoRepository.delete(id);
}
```

#### 8. Parent Mapper — Nested children in `toDto()`

```typescript
toDto(entity: Pedido): PedidoResponseDto {
  const dto: PedidoResponseDto = { id: entity.id, /* parent fields */ };

  if ((entity as any).itens && Array.isArray((entity as any).itens)) {
    dto.itens = (entity as any).itens.map((item: any) => ({
      id: item.id,
      produtoId: item.produtoId,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
    }));
  }
  return dto;
}
```

#### 9. Routes (`routes/pedido.routes.ts`)

```typescript
// Parent-only
router.post('/', validateDto(CreatePedidoDto), asyncHandler(controller.create));

// Parent + children (atomic)
router.post('/completo', validateDto(CreatePedidoCompletoDto), asyncHandler(controller.createCompleto));

// Update parent + children (atomic)
router.put('/:id/completo', validateDto(UpdatePedidoCompletoDto), asyncHandler(controller.updateCompleto));

// Business action that cascades to children
router.post('/:id/cancelar', asyncHandler(controller.cancelar));
```

#### 10. DI Registration

```typescript
// types.ts
IItemPedidoRepository: Symbol.for('IItemPedidoRepository'),

// registerRepositories.ts
container.registerSingleton(TYPES.IItemPedidoRepository, ItemPedidoRepository);
```

### Multi-Level Hierarchy (3+ levels)

For cases like `Emprestimo → EmprestimoItem → EmprestimoItemDevolucao`:
- Each level follows the same pattern: its own Model, Repository, DTO, Mapper
- The **top-level parent service** orchestrates all levels
- Children that inherit tenant from parent do NOT carry their own `tenantId`
- Deep includes: `include: [{ model: EmprestimoItem, as: 'itens', include: [{ model: EmprestimoItemDevolucao, as: 'devolucoes' }] }]`

### Anti-Patterns to Avoid

- **Controller handling children directly** (like `LembreteController`) — always push to the service layer
- **Passing transaction explicitly** — `@Transactional` + `UnitOfWork` handles this automatically via request context
- **Child DTO with parent FK** — use `SemIdDto` suffix; service injects FK after parent creation
- **Separate API calls for parent and children** — use `/completo` route for atomic operations

## Entity Code Generation

For the full table specification template used to auto-generate backend entity scaffolding (model, repository, DTOs, service, controller, routes, migration, DI registration), see [`docs/modelo-especificacao-tabela.md`](docs/modelo-especificacao-tabela.md).

## Eficiência de Contexto

### Disciplina de Subagentes
- Preferir trabalho em linha para tarefas com menos de ~5 chamadas de ferramenta. Subagentes têm overhead — não delegues trivialmente.
- Quando usares subagentes, inclui regras de saída: "Resposta final com menos de 2000 caracteres. Lista resultados, não processos."
- Nunca chames TaskOutput duas vezes para o mesmo subagente. Se ele expirar, aumenta o tempo limite — não releias.

### Leitura de Arquivos
- Lê arquivos com um propósito. Antes de ler um arquivo, sabe o que estás a procurar.
- Usa Grep para localizar seções relevantes antes de ler arquivos grandes inteiros.
- Nunca releias um arquivo que já leste nesta sessão.
- Para arquivos com mais de 500 linhas, usa offset/limit para ler apenas a seção relevante.

### Respostas
- Não repitas conteúdos de arquivos que acabaste de ler — o usuário pode vê-los.
- Não narres chamadas de ferramenta ("Deixa-me ler o arquivo..." / "Agora vou editar..."). Simplesmente faz isso.
- Mantém as explicações proporcionais à complexidade. Mudanças simples precisam de uma frase, não três parágrafos.

RuralIN
