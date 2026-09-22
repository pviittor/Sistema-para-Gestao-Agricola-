# Tarefas Detalhadas - Fase 4: Performance e Escalabilidade

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

## FASE 4: PERFORMANCE E ESCALABILIDADE

### SPRINT 15: Caching - Base

---

#### T15.1 - Setup Redis

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 15  
**Estimativa**: 12 horas

**Descrição**:
Configurar Redis como sistema de cache e criar interface e implementação do CacheService.

**Contexto Técnico**:
- Redis é um banco de dados em memória usado para cache
- Melhora performance reduzindo acesso ao banco de dados
- Necessário para cache distribuído em múltiplas instâncias
- Interface permite trocar implementação se necessário

**Tarefas Específicas**:
1. Instalar Redis localmente e configurar Docker Compose
2. Instalar biblioteca cliente Redis: `npm install redis`
3. Criar interface `ICacheService` em `src/core/cache/ICacheService.ts`:
   ```typescript
   export interface ICacheService {
     get<T>(key: string): Promise<T | null>;
     set(key: string, value: any, ttl?: number): Promise<void>;
     delete(key: string): Promise<void>;
     clear(): Promise<void>;
     exists(key: string): Promise<boolean>;
   }
   ```
4. Implementar `RedisCacheService` em `src/infrastructure/cache/RedisCacheService.ts`
5. Configurar conexão com Redis (variáveis de ambiente)
6. Integrar com DI container
7. Escrever testes unitários

**Código de Referência**:
```typescript
// src/infrastructure/cache/RedisCacheService.ts
import { injectable } from 'tsyringe';
import { createClient } from 'redis';
import { ICacheService } from '../../core/cache/ICacheService';

@injectable()
export class RedisCacheService implements ICacheService {
  private client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.client.connect();
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, serialized);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushAll();
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] Redis instalado e configurado (local e Docker)
- [ ] Interface ICacheService criada
- [ ] RedisCacheService implementado
- [ ] Conexão configurada via variáveis de ambiente
- [ ] Integrado com DI container
- [ ] Testes unitários passando
- [ ] Documentação de configuração criada

**Arquivos a Criar**:
- `src/core/cache/ICacheService.ts`
- `src/infrastructure/cache/RedisCacheService.ts`
- `src/infrastructure/cache/RedisCacheService.spec.ts`
- `docker-compose.redis.yml` (opcional)

---

#### T15.2 - Decorators de Cache

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 15  
**Estimativa**: 32 horas

**Descrição**:
Criar decorators para facilitar uso de cache em métodos de Application Services e Repositories.

**Contexto Técnico**:
- Decorators permitem cache declarativo
- @Cacheable: cacheia resultado do método
- @CacheEvict: invalida cache quando método é executado
- @CachePut: atualiza cache com novo valor
- Geração automática de keys baseada em parâmetros

**Tarefas Específicas**:
1. Criar decorator `@Cacheable(key?: string, ttl?: number)`:
   - Cacheia resultado do método
   - Gera key automaticamente se não fornecida
   - Usa TTL configurado ou padrão
2. Criar decorator `@CacheEvict(key?: string, allEntries?: boolean)`:
   - Remove entrada do cache
   - Opção de limpar todo o cache
3. Criar decorator `@CachePut(key?: string, ttl?: number)`:
   - Atualiza cache com novo valor
4. Implementar geração automática de keys:
   - Baseada em nome do método e parâmetros
   - Formato: `entity:method:param1:param2`
5. Implementar interceptor que:
   - Captura chamada do método
   - Verifica cache antes de executar
   - Armazena resultado no cache
   - Invalida cache quando necessário
6. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/cache/Cacheable.ts
import { ICacheService } from './ICacheService';
import { container } from 'tsyringe';

export function Cacheable(key?: string, ttl: number = 3600) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = container.resolve<ICacheService>('ICacheService');
      const cacheKey = key || generateCacheKey(target.constructor.name, propertyName, args);

      // Verificar cache
      const cached = await cacheService.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Executar método e cachear resultado
      const result = await originalMethod.apply(this, args);
      await cacheService.set(cacheKey, result, ttl);
      return result;
    };

    return descriptor;
  };
}

function generateCacheKey(className: string, methodName: string, args: any[]): string {
  const argsKey = args.map(arg => JSON.stringify(arg)).join(':');
  return `${className}:${methodName}:${argsKey}`;
}
```

**Dependências**:
- T15.1 (Setup Redis)

**Critérios de Aceite**:
- [ ] Decorator @Cacheable criado e funcionando
- [ ] Decorator @CacheEvict criado e funcionando
- [ ] Decorator @CachePut criado e funcionando
- [ ] Geração automática de keys funcionando
- [ ] TTL configurável
- [ ] Testes unitários passando
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/cache/Cacheable.ts`
- `src/core/cache/CacheEvict.ts`
- `src/core/cache/CachePut.ts`
- `src/core/cache/Cacheable.spec.ts`

---

#### T15.3 - Cache no Repository

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 15  
**Estimativa**: 20 horas

**Descrição**:
Integrar cache no BaseRepository para cachear queries frequentes automaticamente.

**Contexto Técnico**:
- Queries findById são muito frequentes e podem ser cacheadas
- findAll com paginação também se beneficia de cache
- Updates e deletes devem invalidar cache automaticamente
- Melhora significativamente performance de leitura

**Tarefas Específicas**:
1. Atualizar BaseRepository para injetar ICacheService
2. Implementar cache em `findById`:
   - Verificar cache antes de query
   - Cachear resultado após query
   - Key: `entity:findById:{id}`
3. Implementar cache em `findAllPaginated`:
   - Cachear resultados paginados
   - Key: `entity:findAll:{page}:{limit}:{options}`
4. Implementar invalidação automática:
   - `create`: invalidar cache de findAll
   - `update`: invalidar cache do registro específico e findAll
   - `delete`: invalidar cache do registro específico e findAll
5. Configurar TTL padrão para queries
6. Escrever testes de integração

**Código de Referência**:
```typescript
// Atualização no BaseRepository
@injectable()
export abstract class BaseRepository<T extends Model> implements IRepository<T> {
  constructor(
    model: ModelCtor<T>,
    @inject('ICacheService') private cacheService: ICacheService
  ) {
    this.model = model;
  }

  async findById(id: number | string): Promise<T | null> {
    const cacheKey = `${this.model.name}:findById:${id}`;
    
    // Verificar cache
    const cached = await this.cacheService.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Query no banco
    const result = await this.model.findByPk(id);
    
    // Cachear resultado
    if (result) {
      await this.cacheService.set(cacheKey, result, 3600);
    }
    
    return result;
  }

  async update(id: number | string, entity: Partial<T>): Promise<T> {
    const result = await super.update(id, entity);
    
    // Invalidar cache
    await this.cacheService.delete(`${this.model.name}:findById:${id}`);
    await this.invalidateFindAllCache();
    
    return result;
  }
}
```

**Dependências**:
- T15.1 (Setup Redis)
- T15.2 (Decorators de Cache)
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] Cache integrado no BaseRepository
- [ ] findById usando cache
- [ ] findAllPaginated usando cache
- [ ] Invalidação automática funcionando
- [ ] Testes de integração passando
- [ ] Performance melhorada (métricas)

**Arquivos a Modificar**:
- `src/core/repository/BaseRepository.ts`

---

#### T15.4 - Cache em Application Services

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 15  
**Estimativa**: 20 horas

**Descrição**:
Aplicar decorators de cache nos Application Services para otimizar métodos de leitura e escrita.

**Tarefas Específicas**:
1. Aplicar `@Cacheable` em métodos de leitura:
   - `getById`: cachear por ID
   - `list`: cachear resultados paginados
2. Aplicar `@CacheEvict` em métodos de escrita:
   - `create`: invalidar cache de list
   - `update`: invalidar cache do registro e list
   - `delete`: invalidar cache do registro e list
3. Configurar TTLs apropriados:
   - Dados que mudam pouco: TTL maior (1 hora)
   - Dados que mudam frequentemente: TTL menor (5 minutos)
4. Testes de integração
5. Validar que cache está funcionando corretamente

**Código de Referência**:
```typescript
@Injectable()
export class UsuarioApplicationService {
  @Cacheable('usuario:getById', 3600)
  async getById(id: number): Promise<UsuarioResponseDto | null> {
    // ...
  }

  @Cacheable('usuario:list', 300)
  async list(page: number, limit: number): Promise<PaginatedResult<UsuarioResponseDto>> {
    // ...
  }

  @CacheEvict('usuario:list')
  async create(dto: CreateUsuarioDto): Promise<UsuarioResponseDto> {
    // ...
  }

  @CacheEvict('usuario:getById', false)
  @CacheEvict('usuario:list')
  async update(id: number, dto: UpdateUsuarioDto): Promise<UsuarioResponseDto> {
    // ...
  }
}
```

**Dependências**:
- T15.2 (Decorators de Cache)
- T7.3, T8.1, T8.2, T8.3, T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] @Cacheable aplicado em métodos de leitura
- [ ] @CacheEvict aplicado em métodos de escrita
- [ ] TTLs configurados apropriadamente
- [ ] Testes de integração passando
- [ ] Cache funcionando corretamente
- [ ] Performance melhorada

**Arquivos a Modificar**:
- Todos os Application Services

---

### SPRINT 16: Caching - Avançado

---

#### T16.1 - Estratégias de Invalidação

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 16  
**Estimativa**: 20 horas

**Descrição**:
Implementar estratégias avançadas de invalidação de cache usando tags e invalidação em cascata.

**Contexto Técnico**:
- Cache por tags permite invalidar grupos relacionados
- Invalidação em cascata: quando um registro é atualizado, invalida relacionados
- Invalidação parcial: invalidar apenas entradas específicas

**Tarefas Específicas**:
1. Implementar sistema de tags no cache:
   - Cada entrada pode ter múltiplas tags
   - Exemplo: `usuario:1` pode ter tags `['usuario', 'usuario:1']`
2. Implementar invalidação por tag:
   - `invalidateByTag(tag: string)`: remove todas entradas com a tag
3. Implementar invalidação em cascata:
   - Quando atualizar Usuario, invalidar seus Eventos, Lembretes, etc.
4. Implementar invalidação parcial:
   - Invalidar apenas entradas específicas mantendo outras
5. Atualizar decorators para suportar tags
6. Escrever testes unitários

**Dependências**:
- T15.1 (Setup Redis)
- T15.2 (Decorators de Cache)

**Critérios de Aceite**:
- [ ] Sistema de tags implementado
- [ ] Invalidação por tag funcionando
- [ ] Invalidação em cascata funcionando
- [ ] Invalidação parcial funcionando
- [ ] Testes passando
- [ ] Documentação criada

**Arquivos a Modificar**:
- `src/core/cache/ICacheService.ts`
- `src/infrastructure/cache/RedisCacheService.ts`
- Decorators de cache

---

#### T16.2 - Cache Distribuído

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 5  
**Sprint**: 16  
**Estimativa**: 20 horas

**Descrição**:
Configurar cache para funcionar em ambiente distribuído com múltiplas instâncias da aplicação.

**Contexto Técnico**:
- Em produção, múltiplas instâncias compartilham o mesmo Redis
- Sincronização de cache entre instâncias
- Configuração de cluster Redis (opcional)

**Tarefas Específicas**:
1. Configurar Redis para múltiplas instâncias
2. Garantir que todas as instâncias usam o mesmo Redis
3. Implementar sincronização de cache:
   - Quando uma instância invalida cache, outras são notificadas
   - Usar Redis Pub/Sub para notificações
4. Configurar connection pooling
5. Testes de integração com múltiplas instâncias
6. Documentar configuração

**Dependências**:
- T15.1 (Setup Redis)

**Critérios de Aceite**:
- [ ] Cache funcionando em múltiplas instâncias
- [ ] Sincronização de cache funcionando
- [ ] Connection pooling configurado
- [ ] Testes de integração passando
- [ ] Documentação de configuração criada

**Arquivos a Modificar**:
- `src/infrastructure/cache/RedisCacheService.ts`
- Configurações de ambiente

---

#### T16.3 - Monitoramento de Cache

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 16  
**Estimativa**: 12 horas

**Descrição**:
Implementar monitoramento de cache com métricas de hit/miss e logging.

**Tarefas Específicas**:
1. Implementar contadores de hit/miss:
   - Contar acessos ao cache
   - Contar hits (cache encontrado)
   - Contar misses (cache não encontrado)
2. Calcular taxa de hit: `hits / (hits + misses)`
3. Integrar com Logger para logar métricas
4. Criar endpoint opcional para expor métricas
5. Dashboard opcional (usando RedisInsight ou similar)

**Dependências**:
- T15.1 (Setup Redis)
- T2.3 (Logger Service)

**Critérios de Aceite**:
- [ ] Métricas de hit/miss implementadas
- [ ] Logging de cache funcionando
- [ ] Endpoint de métricas criado (opcional)
- [ ] Dashboard configurado (opcional)
- [ ] Documentação criada

**Arquivos a Criar**:
- `src/core/cache/CacheMetrics.ts`
- `src/controllers/CacheMetricsController.ts` (opcional)

---

#### T16.4 - Otimizações

**Tipo**: Task  
**Prioridade**: P1  
**Story Points**: 3  
**Sprint**: 16  
**Estimativa**: 12 horas

**Descrição**:
Analisar performance do cache e fazer otimizações de TTL e estratégias.

**Tarefas Específicas**:
1. Analisar métricas de cache coletadas
2. Identificar queries que se beneficiam mais de cache
3. Ajustar TTLs baseado em padrões de uso
4. Otimizar geração de keys
5. Documentar otimizações realizadas
6. Criar guia de boas práticas de cache

**Dependências**:
- T16.3 (Monitoramento de Cache)

**Critérios de Aceite**:
- [ ] Análise de performance realizada
- [ ] TTLs ajustados
- [ ] Performance otimizada
- [ ] Documentação de otimizações criada
- [ ] Guia de boas práticas criado

---

### SPRINT 17: Multi Tenancy - Análise e Planejamento

---

#### T17.1 - Análise de Dados Existentes

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 17  
**Estimativa**: 32 horas

**Descrição**:
Analisar estrutura atual de dados e criar plano de migração para multi-tenancy.

**Contexto Técnico**:
- Sistema atual tem tipos ROOT e CLIENT mas não tem isolamento completo
- Necessário mapear todos os dados existentes para tenants
- Criar estratégia de migração segura
- Planejar rollback se necessário

**Tarefas Específicas**:
1. Analisar estrutura atual de dados:
   - Listar todas as tabelas
   - Identificar relacionamentos
   - Mapear dados por usuário/tipo
2. Identificar como dados serão atribuídos a tenants:
   - Dados de ROOT: qual tenant?
   - Dados de CLIENT: qual tenant?
3. Criar plano de migração detalhado:
   - Ordem de migração das tabelas
   - Scripts de migração
   - Validações pós-migração
4. Criar plano de rollback
5. Documentar análise completa
6. Revisar com equipe

**Dependências**:
- Nenhuma (tarefa de análise)

**Critérios de Aceite**:
- [ ] Análise completa de dados realizada
- [ ] Relacionamentos mapeados
- [ ] Plano de migração criado
- [ ] Plano de rollback criado
- [ ] Documentação completa
- [ ] Plano aprovado pela equipe

**Arquivos a Criar**:
- `docs/multi-tenancy-analysis.md`
- `docs/migration-plan.md`
- `docs/rollback-plan.md`

---

#### T17.2 - Estrutura de TenantId

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 17  
**Estimativa**: 20 horas

**Descrição**:
Adicionar campo TenantId em todas as entidades e criar migrations.

**Tarefas Específicas**:
1. Adicionar campo `tenantId` em todas as entidades:
   - Tipo: `number` ou `string`
   - Não nulo após migração
   - Índice para performance
2. Criar migrations para cada tabela:
   - Adicionar coluna `tenantId`
   - Criar índice
   - Definir como nullable inicialmente (será populado depois)
3. Atualizar modelos Sequelize:
   - Adicionar campo `tenantId` em todos os modelos
   - Atualizar tipos TypeScript
4. Testes de schema
5. Validar migrations em ambiente de desenvolvimento

**Código de Referência**:
```typescript
// Migration exemplo
export async function up(queryInterface: QueryInterface) {
  await queryInterface.addColumn('usuarios', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true, // Será populado na migração de dados
    references: {
      model: 'tenants',
      key: 'id'
    }
  });

  await queryInterface.addIndex('usuarios', ['tenantId']);
}

// Modelo atualizado
export class Usuario extends Model {
  public tenantId!: number;
  // ...
}
```

**Dependências**:
- T17.1 (Análise de Dados)

**Critérios de Aceite**:
- [ ] Campo tenantId adicionado em todas as entidades
- [ ] Migrations criadas para todas as tabelas
- [ ] Modelos atualizados
- [ ] Índices criados
- [ ] Testes de schema passando
- [ ] Migrations validadas

**Arquivos a Modificar**:
- Todos os modelos em `src/models/`
- Criar migrations em `src/migrations/`

---

#### T17.3 - Tenant Service

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 17  
**Estimativa**: 20 horas

**Descrição**:
Criar serviço para gerenciar identificação e validação de tenants.

**Tarefas Específicas**:
1. Criar interface `ITenantService`:
   ```typescript
   export interface ITenantService {
     getCurrentTenantId(): number | null;
     setCurrentTenantId(tenantId: number): void;
     validateTenant(tenantId: number): Promise<boolean>;
   }
   ```
2. Implementar `TenantService`:
   - Armazenar tenantId atual (por requisição)
   - Validar se tenant existe
   - Validar acesso do usuário ao tenant
3. Integrar com DI container
4. Escrever testes unitários

**Código de Referência**:
```typescript
// src/core/tenant/ITenantService.ts
export interface ITenantService {
  getCurrentTenantId(): number | null;
  setCurrentTenantId(tenantId: number): void;
  validateTenant(tenantId: number): Promise<boolean>;
}

// src/core/tenant/TenantService.ts
import { injectable } from 'tsyringe';

@injectable()
export class TenantService implements ITenantService {
  private currentTenantId: number | null = null;

  getCurrentTenantId(): number | null {
    return this.currentTenantId;
  }

  setCurrentTenantId(tenantId: number): void {
    this.currentTenantId = tenantId;
  }

  async validateTenant(tenantId: number): Promise<boolean> {
    // Validar se tenant existe e usuário tem acesso
    // ...
    return true;
  }
}
```

**Dependências**:
- T1.1 (Setup do Container de DI)

**Critérios de Aceite**:
- [ ] ITenantService interface criada
- [ ] TenantService implementado
- [ ] Métodos de identificação funcionando
- [ ] Validação de tenant funcionando
- [ ] Integrado com DI
- [ ] Testes unitários passando

**Arquivos a Criar**:
- `src/core/tenant/ITenantService.ts`
- `src/core/tenant/TenantService.ts`
- `src/core/tenant/TenantService.spec.ts`

---

#### T17.4 - Middleware de Tenant

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 17  
**Estimativa**: 12 horas

**Descrição**:
Criar middleware para identificar e validar tenant em cada requisição.

**Tarefas Específicas**:
1. Criar middleware `tenantMiddleware`:
   - Extrair tenantId do token JWT ou header
   - Validar tenant
   - Armazenar no TenantService
2. Integrar com authMiddleware existente
3. Adicionar tenantId ao RequestContext
4. Tratar erros (tenant inválido, sem tenant)
5. Escrever testes de integração

**Código de Referência**:
```typescript
// src/middleware/tenant.ts
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITenantService } from '../core/tenant/ITenantService';

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantService = container.resolve<ITenantService>('ITenantService');
  
  // Extrair tenantId do token ou header
  const tenantId = extractTenantId(req);
  
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant não identificado' });
  }

  // Validar tenant
  const isValid = await tenantService.validateTenant(tenantId);
  if (!isValid) {
    return res.status(403).json({ error: 'Acesso negado ao tenant' });
  }

  // Armazenar tenantId
  tenantService.setCurrentTenantId(tenantId);
  (req as any).tenantId = tenantId;

  next();
};

function extractTenantId(req: Request): number | null {
  // Extrair do token JWT decodificado
  if ((req as any).user?.tenantId) {
    return (req as any).user.tenantId;
  }
  
  // Ou do header
  const tenantHeader = req.headers['x-tenant-id'];
  if (tenantHeader) {
    return parseInt(tenantHeader as string, 10);
  }
  
  return null;
}
```

**Dependências**:
- T17.3 (Tenant Service)
- T2.4 (Contexto de Requisição)

**Critérios de Aceite**:
- [ ] Middleware criado e funcionando
- [ ] Extração de tenantId funcionando
- [ ] Validação de tenant funcionando
- [ ] Integrado com authMiddleware
- [ ] Testes de integração passando
- [ ] Erros tratados adequadamente

**Arquivos a Criar**:
- `src/middleware/tenant.ts`

**Arquivos a Modificar**:
- `src/routes/index.ts` (adicionar middleware)

---

### SPRINT 18: Multi Tenancy - Implementação

---

#### T18.1 - Filtro Automático no Repository

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 18  
**Estimativa**: 32 horas

**Descrição**:
Atualizar BaseRepository para filtrar automaticamente por TenantId em todas as queries, garantindo isolamento de dados.

**Contexto Técnico**:
- Todas as queries devem incluir filtro por tenantId
- Garantir que usuário só acessa dados do seu tenant
- Validar tenantId em creates/updates
- Isolamento deve ser transparente para Application Services

**Tarefas Específicas**:
1. Atualizar BaseRepository para injetar ITenantService
2. Modificar `findAll` para incluir filtro por tenantId:
   ```typescript
   async findAll(options?: FindOptions): Promise<T[]> {
     const tenantId = this.tenantService.getCurrentTenantId();
     return await this.model.findAll({
       where: {
         ...options?.where,
         tenantId
       },
       // ...
     });
   }
   ```
3. Modificar `findById` para validar tenantId
4. Modificar `create` para adicionar tenantId automaticamente
5. Modificar `update` para validar que registro pertence ao tenant
6. Garantir isolamento em todos os métodos
7. Escrever testes unitários

**Código de Referência**:
```typescript
// Atualização no BaseRepository
@injectable()
export abstract class BaseRepository<T extends Model> implements IRepository<T> {
  constructor(
    model: ModelCtor<T>,
    @inject('ICacheService') private cacheService: ICacheService,
    @inject('ITenantService') private tenantService: ITenantService
  ) {
    this.model = model;
  }

  private getTenantFilter(): { tenantId: number } {
    const tenantId = this.tenantService.getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Tenant não identificado');
    }
    return { tenantId };
  }

  async findAll(options?: FindOptions): Promise<T[]> {
    return await this.model.findAll({
      where: {
        ...this.getTenantFilter(),
        ...options?.where
      },
      // ...
    });
  }

  async create(entity: Partial<T>): Promise<T> {
    const tenantId = this.tenantService.getCurrentTenantId();
    if (!tenantId) {
      throw new Error('Tenant não identificado');
    }
    return await this.model.create({
      ...entity,
      tenantId
    } as any);
  }

  async update(id: number | string, entity: Partial<T>): Promise<T> {
    const instance = await this.findById(id);
    if (!instance) {
      throw new NotFoundException(this.model.name, id);
    }
    
    // Validar que pertence ao tenant
    const tenantId = this.tenantService.getCurrentTenantId();
    if ((instance as any).tenantId !== tenantId) {
      throw new ForbiddenException('Acesso negado a este recurso');
    }
    
    await instance.update(entity);
    return instance;
  }
}
```

**Dependências**:
- T17.3 (Tenant Service)
- T17.4 (Middleware de Tenant)
- T5.2 (BaseRepository)

**Critérios de Aceite**:
- [ ] BaseRepository atualizado com filtros automáticos
- [ ] Isolamento garantido em todas as queries
- [ ] TenantId validado em creates/updates
- [ ] Testes unitários passando
- [ ] Isolamento testado e funcionando

**Arquivos a Modificar**:
- `src/core/repository/BaseRepository.ts`

---

#### T18.2 - Integração com Application Services

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 5  
**Sprint**: 18  
**Estimativa**: 20 horas

**Descrição**:
Garantir que todos os Application Services funcionam corretamente com multi-tenancy.

**Tarefas Específicas**:
1. Revisar todos os Application Services
2. Garantir que tenantId está disponível em todos os métodos
3. Adicionar validações de acesso cross-tenant:
   - Validar que recursos relacionados pertencem ao mesmo tenant
   - Exemplo: Evento deve pertencer ao mesmo tenant do Local
4. Atualizar testes de integração
5. Validar que isolamento está funcionando

**Dependências**:
- T18.1 (Filtro Automático no Repository)
- T7.3, T8.1, T8.2, T8.3, T9.1, T9.2 (Application Services)

**Critérios de Aceite**:
- [ ] Todos os Application Services revisados
- [ ] Validações de tenant implementadas
- [ ] Validações cross-tenant funcionando
- [ ] Testes de integração passando
- [ ] Isolamento garantido

**Arquivos a Modificar**:
- Todos os Application Services

---

#### T18.3 - Migração de Dados

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 8  
**Sprint**: 18  
**Estimativa**: 32 horas

**Descrição**:
Criar e executar script de migração de dados existentes para atribuir TenantId.

**Contexto Técnico**:
- Dados existentes precisam ser atribuídos a tenants
- Migração deve ser segura e reversível
- Validar integridade após migração
- Plano de rollback necessário

**Tarefas Específicas**:
1. Criar script de migração baseado no plano (T17.1)
2. Implementar lógica de atribuição de tenantId:
   - Dados de ROOT: atribuir a tenant específico
   - Dados de CLIENT: atribuir baseado em relacionamento
3. Executar migração em ambiente de desenvolvimento
4. Validar integridade dos dados:
   - Verificar que todos os registros têm tenantId
   - Verificar relacionamentos
   - Verificar que não há dados órfãos
5. Criar script de rollback
6. Testar rollback
7. Documentar processo de migração

**Código de Referência**:
```typescript
// src/migrations/assign-tenant-ids.ts
export async function assignTenantIds() {
  const sequelize = getSequelize();
  const transaction = await sequelize.transaction();

  try {
    // 1. Atribuir tenantId para Usuarios ROOT
    await Usuario.update(
      { tenantId: DEFAULT_TENANT_ID },
      { where: { tipo: 'ROOT' }, transaction }
    );

    // 2. Atribuir tenantId para Usuarios CLIENT baseado em relacionamento
    const clientUsers = await Usuario.findAll({
      where: { tipo: 'CLIENT' },
      include: [UsuarioHasSubUsuario],
      transaction
    });

    for (const user of clientUsers) {
      const rootUser = await UsuarioHasSubUsuario.findOne({
        where: { subUsuarioId: user.id },
        transaction
      });
      if (rootUser) {
        const root = await Usuario.findByPk(rootUser.usuarioId, { transaction });
        await user.update({ tenantId: root.tenantId }, { transaction });
      }
    }

    // 3. Atribuir tenantId para outras entidades baseado em relacionamentos
    // ...

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

**Dependências**:
- T17.1 (Análise de Dados)
- T17.2 (Estrutura de TenantId)

**Critérios de Aceite**:
- [ ] Script de migração criado
- [ ] Migração executada com sucesso
- [ ] Todos os registros têm tenantId
- [ ] Integridade validada
- [ ] Script de rollback criado e testado
- [ ] Documentação completa

**Arquivos a Criar**:
- `src/migrations/assign-tenant-ids.ts`
- `src/migrations/rollback-tenant-ids.ts`

---

#### T18.4 - Testes de Isolamento

**Tipo**: Task  
**Prioridade**: P0  
**Story Points**: 3  
**Sprint**: 18  
**Estimativa**: 12 horas

**Descrição**:
Criar testes completos para garantir isolamento de dados entre tenants.

**Tarefas Específicas**:
1. Criar testes de isolamento:
   - Tenant A não pode acessar dados de Tenant B
   - Queries retornam apenas dados do tenant atual
   - Creates/updates validam tenant
2. Criar testes de segurança:
   - Tentativas de acesso cross-tenant são bloqueadas
   - Validação de tenant em todas as operações
3. Performance testing:
   - Verificar impacto dos filtros de tenant
   - Otimizar queries se necessário
4. Testes de integração completos

**Dependências**:
- T18.1 (Filtro Automático no Repository)
- T18.2 (Integração com Application Services)
- T18.3 (Migração de Dados)

**Critérios de Aceite**:
- [ ] Testes de isolamento criados e passando
- [ ] Testes de segurança criados e passando
- [ ] Performance testado e aceitável
- [ ] Isolamento garantido
- [ ] Documentação de testes criada

**Arquivos a Criar**:
- `src/tests/multi-tenancy/isolation.test.ts`
- `src/tests/multi-tenancy/security.test.ts`

---

## RESUMO DA FASE 4

### Objetivos Alcançados

- ✅ Sistema de cache implementado com Redis
- ✅ Decorators de cache para facilitar uso
- ✅ Cache integrado em Repositories e Application Services
- ✅ Multi-tenancy completo implementado
- ✅ Isolamento de dados garantido
- ✅ Migração de dados realizada

### Métricas Esperadas

- **Performance de Leitura**: Melhoria de 50-80% com cache
- **Taxa de Hit do Cache**: > 70%
- **Isolamento de Dados**: 100% (nenhum acesso cross-tenant)
- **Tempo de Resposta**: Redução de 30-50% em queries frequentes
- **Escalabilidade**: Suporte a múltiplos tenants sem degradação

### Próximos Passos

Após conclusão da Fase 4, seguir para:
- **Fase 5**: Funcionalidades Avançadas (Localization, Dynamic API, Background Jobs, Notifications)
- **Otimizações Contínuas**: Monitorar métricas e ajustar cache conforme necessário

### Considerações Importantes

1. **Cache**: 
   - Monitorar taxa de hit/miss regularmente
   - Ajustar TTLs baseado em padrões de uso
   - Invalidar cache quando necessário

2. **Multi Tenancy**:
   - Validar isolamento em todas as novas features
   - Testar migração em ambiente de staging antes de produção
   - Manter plano de rollback atualizado

3. **Performance**:
   - Índices em tenantId são críticos
   - Monitorar queries lentas
   - Otimizar conforme necessário

---

**Última Atualização**: [Data]  
**Versão**: 1.0  
**Mantido por**: Tech Lead / Arquitetura
