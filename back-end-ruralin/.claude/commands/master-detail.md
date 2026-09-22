---
description: Gerar scaffold completo de entidade master-detail (pai + filhos) seguindo o padrao TituloPagar
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
argument-hint: <especificacao-tabela-ou-descricao>
---

# Skill: Master-Detail Entity Scaffold

Gerar scaffold completo de entidade master-detail para o backend RuralIn.
O argumento recebido pode ser uma especificacao de tabela (formato modelo-especificacao-tabela.md), uma descricao textual, ou nomes das entidades pai/filhos.

## Contexto

$ARGUMENTS

## Instrucoes

### Fase 1: Analise e Planejamento

1. Ler o argumento fornecido e identificar:
   - Nome da entidade master (pai)
   - Nome(s) da(s) entidade(s) detail (filhos)
   - Campos de cada entidade
   - Regras de negocio (validacoes de soma, status, constraints)
   - Tipo de relacionamento (1:N simples, 1:N multiplo, hierarquia 3+ niveis)

2. Se a especificacao for incompleta, perguntar ao usuario usando AskUserQuestion:
   - Quais campos cada entidade deve ter
   - Quais regras de negocio se aplicam
   - Se os filhos devem ter seu proprio tenantId ou herdar do pai
   - Qual o proximo numero de tabela sequencial (C0XX)

3. Consultar a proxima tabela disponivel verificando os models existentes:
   ```
   Glob: back-end-ruralin/src/models/C*.ts
   ```
   Usar o proximo numero sequencial disponivel.

### Fase 2: Verificar Padroes Existentes

Antes de gerar codigo, ler estes arquivos de referencia para garantir aderencia aos padroes:

- `back-end-ruralin/src/models/ParcelaTituloPagar.ts` — Padrao de child model
- `back-end-ruralin/src/infrastructure/repository/IParcelaTituloPagarRepository.ts` — Interface do child repository
- `back-end-ruralin/src/infrastructure/repository/ParcelaTituloPagarRepository.ts` — Implementacao do child repository
- `back-end-ruralin/src/application/dto/tituloPagar/CreateTituloPagarCompletoDto.ts` — DTO completo
- `back-end-ruralin/src/application/dto/tituloPagar/ParcelaTituloPagarSemIdDto.ts` — DTO do filho sem FK
- `back-end-ruralin/src/core/di/types.ts` — Tokens DI existentes

### Fase 3: Gerar Arquivos

Gerar TODOS os arquivos abaixo para cada entidade detail. Substituir `{Master}`, `{Detail}`, `{master}`, `{detail}` pelos nomes reais. Seguir rigorosamente os padroes do TituloPagar.

#### 3.1 Child Model — `models/{Detail}.ts`

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import {Master} from './{Master}';

// Enum de status se aplicavel
export enum Status{Detail} {
  // Definir conforme regras de negocio
}

interface {Detail}Attributes {
  id: number;
  tenantId: number;
  id{Master}: number;                    // FK para o pai
  // ... campos especificos do filho
  usercreation: number;
  datecreation: Date;
}

interface {Detail}CreationAttributes extends Optional<{Detail}Attributes,
  'id' | 'datecreation' /* | outros opcionais */> {}

class {Detail}
  extends Model<{Detail}Attributes, {Detail}CreationAttributes>
  implements {Detail}Attributes
{
  public id!: number;
  public tenantId!: number;
  public id{Master}!: number;
  // ... campos publicos
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos opcionais
  public {master}?: {Master};
  public usuarioCriador?: Usuario;
}

{Detail}.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true,
          comment: 'ID unico' },
    tenantId: { type: DataTypes.INTEGER, allowNull: false, field: 'tenantId',
                comment: 'ID do tenant' },
    id{Master}: { type: DataTypes.INTEGER, allowNull: false,
                  comment: 'FK para {master}',
                  references: { model: 'C0XX_{master}', key: 'id' },
                  onUpdate: 'CASCADE', onDelete: 'CASCADE' },
    // ... demais campos
    usercreation: { type: DataTypes.INTEGER, allowNull: false,
                    comment: 'ID do usuario que criou o registro',
                    references: { model: 'usuarios', key: 'id' } },
    datecreation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW,
                    comment: 'Data de criacao do registro' },
  },
  {
    sequelize,
    tableName: 'C0YY_{detail}',       // Proximo numero sequencial
    timestamps: false,
    underscored: false,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['id{Master}'] },
      { fields: ['usercreation'] },
      // ... indices adicionais conforme necessidade
    ],
  }
);

// Associations AMBAS no arquivo do FILHO (anti-circular-import)
{Detail}.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
{Detail}.belongsTo({Master}, { foreignKey: 'id{Master}', as: '{master}' });
{Master}.hasMany({Detail}, { foreignKey: 'id{Master}', as: '{details}' });

export default {Detail};
```

Regras do model:
- Table name formato `C0YY_camelCase` (proximo numero sequencial)
- `timestamps: false`, `underscored: false`
- FK campo `id{Master}` com `onDelete: 'CASCADE'`
- Ambas associations (`belongsTo` + `hasMany`) neste arquivo
- NUNCA importar o child no arquivo do parent (evitar dependencia circular)

#### 3.2 Child Repository Interface — `infrastructure/repository/I{Detail}Repository.ts`

```typescript
import { IRepository } from '../../core/repository/IRepository';
import {Detail} from '../../models/{Detail}';

export interface I{Detail}Repository extends IRepository<{Detail}> {
  findBy{Master}(id{Master}: number): Promise<{Detail}[]>;
  deleteBy{Master}(id{Master}: number): Promise<number>;
  // Adicionar metodos especificos do dominio
}
```

Regras:
- Sempre incluir `findBy{Master}` e `deleteBy{Master}`
- Adicionar metodos especificos (por status, por data, etc.) conforme regras de negocio

#### 3.3 Child Repository Implementation — `infrastructure/repository/{Detail}Repository.ts`

```typescript
import { Injectable, Inject } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { BaseRepository } from '../../core/repository/BaseRepository';
import { I{Detail}Repository } from './I{Detail}Repository';
import { ICacheService } from '../../core/cache/ICacheService';
import { ITenantService } from '../../core/tenant/ITenantService';
import {Detail} from '../../models/{Detail}';
import {Master} from '../../models/{Master}';

@Injectable()
export class {Detail}Repository
  extends BaseRepository<{Detail}>
  implements I{Detail}Repository
{
  constructor(
    @Inject(TYPES.ICacheService) cacheService: ICacheService,
    @Inject(TYPES.ITenantService) tenantService: ITenantService
  ) {
    super({Detail}, cacheService, tenantService);
  }

  async findBy{Master}(id{Master}: number): Promise<{Detail}[]> {
    const tenantFilter = this.getTenantFilter();
    const cacheKey = `{detail}:findBy{Master}:${id{Master}}:${JSON.stringify(tenantFilter)}`;
    const cached = await this.cacheService.get<{Detail}[]>(cacheKey);
    if (cached !== null) return cached;

    const where: any = { id{Master} };
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;

    const result = await this.model.findAll({
      where,
      order: [['id', 'ASC']],
      include: [{ model: {Master}, as: '{master}', required: false }],
    });
    await this.cacheService.set(cacheKey, result, this.DEFAULT_CACHE_TTL);
    return result;
  }

  async deleteBy{Master}(id{Master}: number): Promise<number> {
    const tenantFilter = this.getTenantFilter();
    const where: any = { id{Master} };
    if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;
    return this.model.destroy({ where });
  }
}
```

Regras:
- `@Injectable()` (sem `@singleton`)
- Constructor: exatamente `@Inject(TYPES.ICacheService)` e `@Inject(TYPES.ITenantService)`
- `super({Detail}, cacheService, tenantService)`
- Cache key: `{detail}:methodName:param:${JSON.stringify(tenantFilter)}`
- Tenant filter: `const tenantFilter = this.getTenantFilter(); if (tenantFilter?.tenantId) where.tenantId = tenantFilter.tenantId;`
- Include com `required: false`

#### 3.4 Child DTO (sem FK do pai) — `application/dto/{master}/{Detail}SemIdDto.ts`

```typescript
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsInt, Min,
         IsDateString, IsEnum, Validate } from 'class-validator';
// Importar validators customizados conforme necessidade
// import { IsExists } from '../../validators/IsExists';

export class {Detail}SemIdDto {
  // NAO incluir id, id{Master}, tenantId, usercreation, datecreation
  // Apenas campos que o usuario preenche

  // Exemplo:
  // @IsNotEmpty({ message: 'Campo X e obrigatorio' })
  // @IsNumber({}, { message: 'Campo X deve ser um numero' })
  // campoX!: number;
}
```

Regras:
- NAO incluir `id`, `id{Master}`, `tenantId`, `usercreation`, `datecreation` — service injeta
- Datas como `string` (ISO format), nao `Date`
- Todas as mensagens em portugues
- `@IsNotEmpty` + validator de tipo para campos obrigatorios
- `@IsOptional` + validator para campos opcionais

#### 3.5 DTO Completo — `application/dto/{master}/Create{Master}CompletoDto.ts`

```typescript
import { IsArray, ValidateNested, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Create{Master}Dto } from './Create{Master}Dto';
import { {Detail}SemIdDto } from './{Detail}SemIdDto';

export class Create{Master}CompletoDto extends Create{Master}Dto {
  @IsArray({ message: '{Details} deve ser um array' })
  @ArrayMinSize(1, { message: 'Deve haver pelo menos um(a) {detail}' })
  @ValidateNested({ each: true })
  @Type(() => {Detail}SemIdDto)
  {details}!: {Detail}SemIdDto[];

  // Para colecoes opcionais de filhos:
  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => OutroFilhoSemIdDto)
  // outrosFilhos?: OutroFilhoSemIdDto[];
}
```

Regras:
- Extends `Create{Master}Dto` (herda validacoes do pai)
- Array obrigatorio: `@IsArray` + `@ArrayMinSize(1)` + `@ValidateNested({ each: true })` + `@Type(() => ChildDto)`
- Array opcional: `@IsOptional()` + `@IsArray` + `@ValidateNested({ each: true })` + `@Type(() => ChildDto)`

#### 3.6 DTO Update Completo — `application/dto/{master}/Update{Master}CompletoDto.ts`

```typescript
import { IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Update{Master}Dto } from './Update{Master}Dto';
import { {Detail}SemIdDto } from './{Detail}SemIdDto';

export class Update{Master}CompletoDto extends Update{Master}Dto {
  @IsOptional()
  @IsArray({ message: '{Details} deve ser um array' })
  @ValidateNested({ each: true })
  @Type(() => {Detail}SemIdDto)
  {details}?: {Detail}SemIdDto[];
}
```

#### 3.7 Response DTO — Adicionar filhos ao `{Master}ResponseDto.ts`

Adicionar ao ResponseDto existente do master:

```typescript
// Adicionar apos os campos do pai:
{details}?: {
  id: number;
  // ... campos do filho
}[] | null;
```

#### 3.8 Mapper — Adicionar mapeamento de filhos ao `{Master}Mapper.ts`

Adicionar ao metodo `toDto()` do mapper existente:

```typescript
// Dentro de toDto():
if ((entity as any).{details} && Array.isArray((entity as any).{details})) {
  dto.{details} = (entity as any).{details}.map((item: any) => ({
    id: item.id,
    // ... mapear campos do filho
  }));
}
```

#### 3.9 Service — Metodos `createCompleto` e `updateCompleto`

Adicionar ao Application Service do master. Injetar child repository(ies) no constructor:

```typescript
// No constructor, adicionar:
@Inject(TYPES.I{Detail}Repository) private {detail}Repository: I{Detail}Repository,

// Metodo createCompleto:
@RequirePermission('{master}.create')
@Transactional()
@Auditable('{Master}')
@CacheEvict('{master}:list:*', true)
async createCompleto(dto: Create{Master}CompletoDto): Promise<{Master}ResponseDto> {
  const context = getRequestContext();
  if (!context || !context.getUserId()) {
    throw new ForbiddenException('Usuario nao autenticado.', 'USER_NOT_AUTHENTICATED');
  }
  const userId = context.getUserId()!;
  const tenantId = context.getTenantId();
  if (!tenantId) {
    throw new ForbiddenException('Tenant nao identificado.', 'TENANT_NOT_IDENTIFIED');
  }

  // Validacoes de negocio (somas, unicidade, etc.)
  // ...

  // Criar pai
  const {master}Entity = await this.mapper.toEntity(dto);
  ({master}Entity as any).usercreation = userId;
  ({master}Entity as any).datecreation = new Date();
  ({master}Entity as any).tenantId = tenantId;
  const created{Master} = await this.{master}Repository.create({master}Entity as any);

  // Criar filhos — injetar FK + tenant
  for (const itemDto of dto.{details}) {
    const itemEntity = await this.{detail}Mapper.toEntity({
      ...itemDto,
      id{Master}: created{Master}.id,     // FK injetada aqui
    });
    (itemEntity as any).usercreation = userId;
    (itemEntity as any).datecreation = new Date();
    (itemEntity as any).tenantId = tenantId;
    await this.{detail}Repository.create(itemEntity as any);
  }

  // Audit
  await this.auditService.logCreate('{master}', userId, dto);

  // Retornar registro completo com filhos
  const {master}Completo = await this.{master}Repository.findById(created{Master}.id);
  return this.mapper.toDto({master}Completo!);
}

// Metodo updateCompleto (delete-and-recreate):
@RequirePermission('{master}.update')
@Transactional()
@Auditable('{Master}')
@CacheEvict('{master}:list:*', true)
async updateCompleto(id: number, dto: Update{Master}CompletoDto): Promise<{Master}ResponseDto> {
  const context = getRequestContext();
  const userId = context!.getUserId()!;
  const tenantId = context!.getTenantId()!;

  // Atualizar pai
  const {master}Entity = await this.mapper.toEntity(dto);
  await this.{master}Repository.update(id, {master}Entity as any);

  // Delete-and-recreate filhos
  if (dto.{details}) {
    await this.{detail}Repository.deleteBy{Master}(id);
    for (const itemDto of dto.{details}) {
      await this.{detail}Repository.create({
        ...itemDto,
        id{Master}: id,
        tenantId,
        usercreation: userId,
        datecreation: new Date(),
      } as any);
    }
  }

  const {master}Completo = await this.{master}Repository.findById(id);
  return this.mapper.toDto({master}Completo!);
}

// Delete com validacao cascade:
async delete(id: number | string): Promise<boolean> {
  // Verificar se ha filhos que impedem exclusao
  const {details} = await this.{detail}Repository.findBy{Master}(Number(id));
  // Aplicar regras de negocio (ex: filhos com status que impede delete)
  // if ({details}.some(d => d.status === 'CONCLUIDO')) {
  //   throw new BusinessException('Nao e possivel deletar...', 'DELETE_BLOCKED');
  // }
  return await this.{master}Repository.delete(id);
}
```

Decorator stack (ordem importa — de cima para baixo):
1. `@RequirePermission` — RBAC
2. `@Transactional()` — wrapping de transacao DB
3. `@Auditable` — auditoria
4. `@CacheEvict` — invalidacao de cache

#### 3.10 Controller — Adicionar metodos

```typescript
async createCompleto(req: Request, res: Response): Promise<void> {
  const dto = req.body as Create{Master}CompletoDto;
  const result = await this.{master}Service.createCompleto(dto);
  res.status(201).json(result);
}

async updateCompleto(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const dto = req.body as Update{Master}CompletoDto;
  const result = await this.{master}Service.updateCompleto(id, dto);
  res.status(200).json(result);
}
```

#### 3.11 Routes — Adicionar rotas `/completo`

```typescript
// ANTES das rotas com parametro (/:id)
router.post('/completo',
  requirePermission('{master}.create'),
  validateDto(Create{Master}CompletoDto),
  asyncHandler(async (req, res) => {
    await get{Master}Controller().createCompleto(req, res);
  })
);

router.put('/:id/completo',
  requirePermission('{master}.update'),
  validateDtoUpdate(Update{Master}CompletoDto),
  asyncHandler(async (req, res) => {
    await get{Master}Controller().updateCompleto(req, res);
  })
);

// Acao de negocio que afeta filhos (opcional)
router.post('/:id/cancelar',
  requirePermission('{master}.delete'),
  asyncHandler(async (req, res) => {
    await get{Master}Controller().cancelar(req, res);
  })
);
```

Regra de ordenacao: rotas especificas (`/completo`, `/status/:status`) ANTES de rotas parametrizadas (`/:id`).

#### 3.12 DI Registration

Em `core/di/types.ts`:
```typescript
I{Detail}Repository: Symbol.for('I{Detail}Repository'),
```

Em `core/di/registerRepositories.ts`:
```typescript
container.registerSingleton(TYPES.I{Detail}Repository, {Detail}Repository);
```

#### 3.13 Controller Interface (se necessario)

Se o controller do master nao tiver interface para os novos metodos, atualizar `controllers/interfaces/I{Master}Controller.ts`:
```typescript
createCompleto(req: Request, res: Response): Promise<void>;
updateCompleto(req: Request, res: Response): Promise<void>;
```

#### 3.14 Migration (se necessario)

Gerar migration para a tabela filha seguindo o padrao existente em `migrations/`.

### Fase 4: Validacao

Apos gerar todos os arquivos:

1. Verificar se todos os imports estao corretos
2. Verificar se nao ha dependencia circular (parent NAO importa child model)
3. Verificar se os tokens DI estao registrados
4. Verificar se as rotas `/completo` estao ANTES das rotas `/:id`
5. Listar todos os arquivos criados/modificados para o usuario

### Anti-Patterns (NAO fazer)

- NAO tratar filhos diretamente no controller (sempre no service)
- NAO passar transaction explicitamente (usar `@Transactional`)
- NAO incluir FK do pai no DTO do filho (usar `SemIdDto`)
- NAO criar endpoints separados para pai e filhos (usar `/completo`)
- NAO importar o model filho no arquivo do model pai
- NAO esquecer de registrar tokens DI

### Checklist Final

Antes de considerar a task concluida, confirmar:
- [ ] Child Model com associations no arquivo do filho
- [ ] Child Repository interface com `findBy{Master}` e `deleteBy{Master}`
- [ ] Child Repository implementation com tenant filter e cache
- [ ] `{Detail}SemIdDto` sem FK do pai
- [ ] `Create{Master}CompletoDto extends Create{Master}Dto`
- [ ] `Update{Master}CompletoDto extends Update{Master}Dto`
- [ ] Response DTO com array de filhos
- [ ] Mapper com mapeamento de filhos em `toDto()`
- [ ] Service com `createCompleto` e `updateCompleto`
- [ ] Service com decorator stack correto
- [ ] Controller com metodos thin
- [ ] Routes com `/completo` antes de `/:id`
- [ ] DI tokens registrados em `types.ts` e `container.ts`/`registerRepositories.ts`
- [ ] Controller interface atualizada
- [ ] Sem dependencias circulares
