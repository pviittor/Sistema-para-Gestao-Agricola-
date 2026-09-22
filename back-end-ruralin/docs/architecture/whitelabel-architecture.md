# Arquitetura WhiteLabel - Sistema de Gerenciamento de Consultorias e Tenants

## 1. Visão Geral

Este documento descreve a arquitetura para implementação de um sistema WhiteLabel que permite:
- Distribuição multi-tenant com isolamento completo de dados
- Gerenciamento hierárquico: GOD → CONSULTOR → TENANT → Usuários
- Controle de acesso e desativação de tenants
- Gestão de consultorias e seus tenants associados

## 2. Arquitetura e Abordagem

### 2.1. Hierarquia de Usuários

```
┌─────────────────────────────────────────────────────────────┐
│                    USUÁRIO GOD                              │
│  - Cadastra Consultorias                                   │
│  - Gerencia Consultores                                     │
│  - Acesso total ao sistema                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  USUÁRIO CONSULTOR                          │
│  - Pertence a uma Consultoria                               │
│  - Cadastra e gerencia Tenants                              │
│  - Visualiza dados agregados dos seus tenants               │
│  - Pode desativar/ativar tenants                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    TENANT                                    │
│  - Pertence a uma Consultoria                                │
│  - Possui status (ativo/inativo)                             │
│  - Isolamento completo de dados                             │
│  - Configurações próprias                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              USUÁRIOS DO TENANT                              │
│  - ROOT: Administrador do tenant                            │
│  - CLIENT: Usuários finais                                  │
│  - Acesso limitado aos dados do seu tenant                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2. Modelo de Dados

#### 2.2.1. Consultoria (Consultoria)
- **Campos principais:**
  - `id` (PK)
  - `tenantId` (FK para tenant da consultoria - opcional, pode ser NULL para consultoria raiz)
  - `razaoSocial` (string)
  - `nomeFantasia` (string)
  - `cnpj` (string, único)
  - `email` (string)
  - `telefone` (string)
  - `ativo` (boolean) - controla se a consultoria está ativa
  - `dataAtivacao` (date)
  - `dataDesativacao` (date, nullable)
  - `limiteTenants` (integer) - limite de tenants permitidos
  - `tenantCount` (integer, calculado) - quantidade atual de tenants
  - `usercreation` (FK para Usuario)
  - `datecreation` (date)

#### 2.2.2. Tenant (Tenant)
- **Campos principais:**
  - `id` (PK)
  - `consultoriaId` (FK para Consultoria) - **NOVO CAMPO**
  - `nome` (string)
  - `slug` (string, único) - identificador único para URLs/subdomínios
  - `ativo` (boolean) - **NOVO CAMPO** - controla acesso
  - `dataAtivacao` (date)
  - `dataDesativacao` (date, nullable)
  - `configuracoes` (JSON) - configurações específicas do tenant
  - `limiteUsuarios` (integer) - limite de usuários permitidos
  - `usercreation` (FK para Usuario)
  - `datecreation` (date)

#### 2.2.3. Usuario (atualização)
- **Campos adicionais:**
  - `consultoriaId` (FK para Consultoria, nullable) - apenas para usuários CONSULTOR
  - `tipo` (enum) - expandir para: `GOD`, `CONSULTOR`, `ROOT`, `CLIENT`

### 2.3. Princípios Arquiteturais

1. **Isolamento Total de Dados**
   - Cada tenant possui isolamento completo
   - Filtros automáticos por `tenantId` em todas as queries
   - Validação cross-tenant em todas as operações

2. **Hierarquia de Acesso**
   - GOD: Acesso total, sem restrições
   - CONSULTOR: Acesso apenas aos seus tenants
   - ROOT/CLIENT: Acesso apenas ao seu tenant

3. **Controle de Ativação/Desativação**
   - Tenants podem ser desativados sem perder dados
   - Desativação bloqueia acesso imediato
   - Reativação restaura acesso

4. **Multi-tenancy com Consultoria**
   - Consultorias são entidades de nível superior
   - Tenants pertencem a uma consultoria
   - Consultores gerenciam apenas seus tenants

## 3. Lista de Arquivos (Novos/Alterados)

### 3.1. Novos Arquivos

#### Models
- `src/models/Consultoria.ts` - Modelo Sequelize para Consultoria
- `src/models/Tenant.ts` - Modelo Sequelize para Tenant (se não existir)

#### Repositories
- `src/infrastructure/repository/IConsultoriaRepository.ts`
- `src/infrastructure/repository/ConsultoriaRepository.ts`
- `src/infrastructure/repository/ITenantRepository.ts` (se não existir)
- `src/infrastructure/repository/TenantRepository.ts` (se não existir)

#### DTOs
- `src/application/dto/consultoria/CreateConsultoriaDto.ts`
- `src/application/dto/consultoria/UpdateConsultoriaDto.ts`
- `src/application/dto/consultoria/ConsultoriaResponseDto.ts`
- `src/application/dto/consultoria/index.ts`
- `src/application/dto/tenant/CreateTenantDto.ts`
- `src/application/dto/tenant/UpdateTenantDto.ts`
- `src/application/dto/tenant/TenantResponseDto.ts`
- `src/application/dto/tenant/index.ts`

#### Mappers
- `src/application/mappers/ConsultoriaMapper.ts`
- `src/application/mappers/TenantMapper.ts`

#### Services
- `src/application/services/consultoria/IConsultoriaApplicationService.ts`
- `src/application/services/consultoria/ConsultoriaApplicationService.ts`
- `src/application/services/tenant/ITenantApplicationService.ts`
- `src/application/services/tenant/TenantApplicationService.ts`
- `src/application/services/tenant/TenantActivationService.ts` - Serviço para ativar/desativar tenants

#### Controllers
- `src/controllers/interfaces/IConsultoriaController.ts`
- `src/controllers/ConsultoriaController.ts`
- `src/controllers/interfaces/ITenantController.ts`
- `src/controllers/TenantController.ts`

#### Routes
- `src/routes/consultoria.routes.ts`
- `src/routes/tenant.routes.ts`

#### Middleware
- `src/middleware/tenantActivation.ts` - Middleware para verificar se tenant está ativo
- `src/middleware/consultoriaAccess.ts` - Middleware para validar acesso de consultor

#### Core Services
- `src/core/tenant/ITenantActivationService.ts`
- `src/core/tenant/TenantActivationService.ts`
- `src/core/consultoria/IConsultoriaService.ts`
- `src/core/consultoria/ConsultoriaService.ts`

#### Migrations
- `src/migrations/YYYYMMDDHHMMSS-create-consultoria.ts`
- `src/migrations/YYYYMMDDHHMMSS-create-tenant.ts` (se não existir)
- `src/migrations/YYYYMMDDHHMMSS-add-consultoriaId-to-tenant.ts`
- `src/migrations/YYYYMMDDHHMMSS-add-consultoriaId-to-usuario.ts`
- `src/migrations/YYYYMMDDHHMMSS-add-ativo-to-tenant.ts`
- `src/migrations/YYYYMMDDHHMMSS-populate-initial-data.ts` - Dados iniciais (GOD, consultoria raiz)

#### Validators
- `src/application/validators/IsActiveTenant.ts` - Validador para verificar se tenant está ativo
- `src/application/validators/IsWithinTenantLimit.ts` - Validador para limite de tenants

#### Policies (Authorization)
- `src/core/authorization/policies/consultoriaPolicies.ts`
- `src/core/authorization/policies/tenantPolicies.ts`

#### Documentation
- `docs/features/fase-6/T21.1-WhiteLabel-Architecture.md`
- `docs/features/fase-6/T21.2-Consultoria-Management.md`
- `docs/features/fase-6/T21.3-Tenant-Activation.md`
- `docs/features/fase-6/T21.4-Hierarchical-Access.md`

### 3.2. Arquivos a Alterar

#### Models
- `src/models/Usuario.ts`
  - Adicionar campo `consultoriaId` (nullable)
  - Expandir enum `tipo` para incluir `GOD` e `CONSULTOR`
  - Adicionar relacionamento `belongsTo` com Consultoria

#### Repositories
- `src/infrastructure/repository/UsuarioRepository.ts`
  - Adicionar método `findByConsultoria(consultoriaId: number)`
  - Ajustar filtros para considerar tipo de usuário

#### Services
- `src/application/services/usuario/UsuarioApplicationService.ts`
  - Adicionar validação de tipo de usuário
  - Validar criação de CONSULTOR apenas por GOD
  - Validar criação de ROOT/CLIENT apenas por CONSULTOR ou ROOT

#### Core Services
- `src/core/tenant/TenantService.ts`
  - Adicionar método `isTenantActive(tenantId: number): Promise<boolean>`
  - Adicionar método `getTenantBySlug(slug: string): Promise<Tenant | null>`
  - Adicionar método `getConsultoriaByTenant(tenantId: number): Promise<Consultoria | null>`

#### Middleware
- `src/middleware/auth.ts`
  - Adicionar verificação de tipo de usuário
  - Adicionar verificação de tenant ativo
  - Adicionar verificação de consultoria ativa

- `src/middleware/tenant.ts`
  - Integrar com `TenantActivationService`
  - Bloquear acesso se tenant estiver inativo

#### Authorization
- `src/core/authorization/RequirePermission.ts`
  - Adicionar lógica para GOD (bypass de permissões)
  - Adicionar lógica para CONSULTOR (acesso apenas aos seus tenants)

- `src/application/services/AuthorizationService.ts`
  - Adicionar métodos para verificar acesso de consultor
  - Adicionar métodos para verificar acesso de GOD

#### DI Registration
- `src/core/di/types.ts` - Adicionar tokens para novos serviços
- `src/core/di/registerRepositories.ts` - Registrar novos repositories
- `src/core/di/registerServices.ts` - Registrar novos services
- `src/core/di/registerControllers.ts` - Registrar novos controllers

#### Routes
- `src/routes/index.ts` - Adicionar rotas de consultoria e tenant

#### Swagger
- `src/config/swagger.ts` - Adicionar schemas e tags

## 4. Fluxo de Dados

### 4.1. Fluxo de Autenticação

```
1. Usuário faz login
   ↓
2. AuthController valida credenciais
   ↓
3. Verifica tipo de usuário:
   - GOD: Acesso total, sem tenant
   - CONSULTOR: Acesso com consultoriaId, sem tenant específico
   - ROOT/CLIENT: Acesso com tenantId
   ↓
4. Verifica se tenant está ativo (se aplicável)
   ↓
5. Verifica se consultoria está ativa (se aplicável)
   ↓
6. Gera token JWT com:
   - userId
   - tipo
   - tenantId (se aplicável)
   - consultoriaId (se aplicável)
   ↓
7. Retorna token e informações do usuário
```

### 4.2. Fluxo de Criação de Consultoria (GOD)

```
1. GOD faz POST /api/consultorias
   ↓
2. ConsultoriaController.create()
   ↓
3. Valida permissão: apenas GOD pode criar
   ↓
4. ConsultoriaApplicationService.create()
   ↓
5. Valida CNPJ único
   ↓
6. Cria Consultoria com:
   - ativo: true
   - dataAtivacao: now()
   - usercreation: userId do GOD
   ↓
7. Retorna ConsultoriaResponseDto
```

### 4.3. Fluxo de Criação de Tenant (CONSULTOR)

```
1. CONSULTOR faz POST /api/tenants
   ↓
2. TenantController.create()
   ↓
3. Valida permissão: apenas CONSULTOR pode criar
   ↓
4. TenantApplicationService.create()
   ↓
5. Validações:
   - Consultoria existe e está ativa
   - CONSULTOR pertence à consultoria
   - Limite de tenants não excedido
   - Slug único
   ↓
6. Cria Tenant com:
   - consultoriaId: da consultoria do CONSULTOR
   - ativo: true
   - dataAtivacao: now()
   - usercreation: userId do CONSULTOR
   ↓
7. Incrementa tenantCount na Consultoria
   ↓
8. Retorna TenantResponseDto
```

### 4.4. Fluxo de Desativação de Tenant

```
1. CONSULTOR faz PUT /api/tenants/:id/desativar
   ↓
2. TenantController.desativar()
   ↓
3. Validações:
   - Tenant pertence à consultoria do CONSULTOR
   - Tenant está ativo
   ↓
4. TenantActivationService.desativar()
   ↓
5. Atualiza Tenant:
   - ativo: false
   - dataDesativacao: now()
   ↓
6. Invalida todos os tokens JWT do tenant
   ↓
7. Bloqueia acesso imediato (middleware)
   ↓
8. Retorna sucesso
```

### 4.5. Fluxo de Acesso a Recursos (Usuário do Tenant)

```
1. Usuário faz requisição autenticada
   ↓
2. authMiddleware valida token
   ↓
3. tenantActivationMiddleware verifica:
   - Tenant está ativo?
   - Consultoria está ativa?
   ↓
4. Se inativo: retorna 403 Forbidden
   ↓
5. Se ativo: continua
   ↓
6. tenantMiddleware aplica filtro tenantId
   ↓
7. BaseRepository aplica filtro automático
   ↓
8. Retorna dados isolados do tenant
```

### 4.6. Fluxo de Consulta Agregada (CONSULTOR)

```
1. CONSULTOR faz GET /api/consultorias/:id/tenants
   ↓
2. ConsultoriaController.getTenants()
   ↓
3. Validações:
   - CONSULTOR pertence à consultoria
   ↓
4. ConsultoriaApplicationService.getTenants()
   ↓
5. Busca todos os tenants da consultoria
   (sem filtro de tenantId, mas com filtro de consultoriaId)
   ↓
6. Retorna lista de tenants com dados agregados
```

## 5. Casos Extremos (Edge Cases)

### 5.1. Desativação de Tenant com Usuários Ativos

**Cenário:** CONSULTOR desativa um tenant enquanto há usuários logados.

**Solução:**
- Middleware `tenantActivationMiddleware` verifica status em cada requisição
- Tokens JWT não são invalidados imediatamente, mas validação ocorre a cada request
- Usuários ativos recebem 403 na próxima requisição
- Implementar notificação via WebSocket (opcional, fase futura)

### 5.2. Limite de Tenants Excedido

**Cenário:** CONSULTOR tenta criar tenant além do limite.

**Solução:**
- Validação no `TenantApplicationService.create()`
- Verificar `tenantCount < limiteTenants`
- Retornar erro 400 com mensagem clara
- Permitir aumento de limite (apenas GOD)

### 5.3. Desativação de Consultoria com Tenants Ativos

**Cenário:** GOD desativa uma consultoria que possui tenants ativos.

**Solução:**
- Desativar consultoria automaticamente desativa todos os tenants
- Cascade de desativação
- Bloquear acesso de todos os usuários dos tenants
- Manter dados para possível reativação

### 5.4. Migração de Tenant entre Consultorias

**Cenário:** Necessidade de mover tenant de uma consultoria para outra.

**Solução:**
- Operação crítica, requer validação especial
- Apenas GOD pode executar
- Validar que consultoria destino tem capacidade
- Atualizar `consultoriaId` do tenant
- Notificar ambas as consultorias
- Registrar em log de auditoria

### 5.5. Exclusão de Consultoria

**Cenário:** GOD tenta excluir uma consultoria.

**Solução:**
- Soft delete (marcar como inativa)
- Não permitir exclusão física se houver tenants
- Opção de arquivamento
- Manter histórico para auditoria

### 5.6. Conflito de Slug de Tenant

**Cenário:** Dois tenants com mesmo slug em consultorias diferentes.

**Solução:**
- Slug deve ser único globalmente
- Validação no `TenantApplicationService`
- Sugerir slug alternativo se conflito
- Considerar prefixo com consultoriaId (opcional)

### 5.7. Usuário CONSULTOR sem Consultoria

**Cenário:** Usuário do tipo CONSULTOR sem `consultoriaId` associado.

**Solução:**
- Validação no `UsuarioApplicationService.create()`
- CONSULTOR deve ter `consultoriaId` obrigatório
- Bloquear criação se não fornecido
- Validar que consultoria existe e está ativa

### 5.8. Acesso de GOD a Dados de Tenants

**Cenário:** GOD precisa acessar dados de um tenant específico.

**Solução:**
- GOD pode especificar `tenantId` em header especial
- Endpoint administrativo: `/api/admin/tenants/:id/data`
- Registrar em log de auditoria
- Notificar tenant sobre acesso (opcional)

### 5.9. Reativação de Tenant

**Cenário:** CONSULTOR reativa um tenant previamente desativado.

**Solução:**
- Validar que consultoria está ativa
- Atualizar `ativo: true` e `dataAtivacao: now()`
- Limpar `dataDesativacao`
- Permitir acesso imediato
- Notificar usuários (opcional)

### 5.10. Expiração de Limite de Tenants

**Cenário:** Consultoria atinge limite, mas precisa criar mais tenants.

**Solução:**
- GOD pode aumentar `limiteTenants`
- Histórico de alterações de limite
- Notificar CONSULTOR sobre limite próximo
- Opção de plano com limite maior

## 6. Riscos

### 6.1. Riscos Técnicos

#### 6.1.1. Isolamento de Dados
- **Risco:** Vazamento de dados entre tenants
- **Mitigação:**
  - Filtros automáticos no `BaseRepository`
  - Validação em todas as queries
  - Testes de isolamento abrangentes
  - Code review rigoroso

#### 6.1.2. Performance com Muitos Tenants
- **Risco:** Degradação de performance com crescimento
- **Mitigação:**
  - Índices adequados em `tenantId` e `consultoriaId`
  - Cache por tenant
  - Particionamento de dados (fase futura)
  - Monitoramento de performance

#### 6.1.3. Complexidade de Queries
- **Risco:** Queries complexas com múltiplos filtros
- **Mitigação:**
  - Otimização de queries
  - Uso de índices compostos
  - Análise de query plans
  - Limitação de joins complexos

#### 6.1.4. Transações Cross-Tenant
- **Risco:** Operações que envolvem múltiplos tenants
- **Mitigação:**
  - Evitar transações cross-tenant
  - Se necessário, validação explícita
  - Logging detalhado
  - Apenas para operações administrativas

### 6.2. Riscos de Negócio

#### 6.2.1. Acesso Não Autorizado
- **Risco:** CONSULTOR acessa dados de outra consultoria
- **Mitigação:**
  - Validação rigorosa de `consultoriaId`
  - Testes de segurança
  - Auditoria de acessos
  - Permissões granulares

#### 6.2.2. Perda de Dados
- **Risco:** Exclusão acidental de tenant/consultoria
- **Mitigação:**
  - Soft delete (não exclusão física)
  - Backups regulares
  - Logs de auditoria
  - Período de retenção

#### 6.2.3. Escalabilidade
- **Risco:** Sistema não suporta crescimento
- **Mitigação:**
  - Arquitetura escalável desde o início
  - Monitoramento de capacidade
  - Planejamento de infraestrutura
  - Load balancing

### 6.3. Riscos de Segurança

#### 6.3.1. Elevação de Privilégios
- **Risco:** Usuário tenta se passar por GOD/CONSULTOR
- **Mitigação:**
  - Validação de tipo no token JWT
  - Verificação em cada requisição
  - Não confiar apenas no frontend
  - Validação server-side

#### 6.3.2. Token JWT Comprometido
- **Risco:** Token roubado permite acesso não autorizado
- **Mitigação:**
  - Expiração curta de tokens
  - Refresh tokens
  - Revogação de tokens (blacklist)
  - HTTPS obrigatório

#### 6.3.3. SQL Injection
- **Risco:** Ataques de injeção SQL
- **Mitigação:**
  - Uso de ORM (Sequelize) com prepared statements
  - Validação de inputs
  - Sanitização de dados
  - Testes de segurança

### 6.4. Riscos Operacionais

#### 6.4.1. Migração de Dados
- **Risco:** Erros durante migração de schema
- **Mitigação:**
  - Migrações incrementais
  - Rollback plan
  - Testes em ambiente de staging
  - Backup antes de migração

#### 6.4.2. Downtime
- **Risco:** Sistema indisponível durante atualizações
- **Mitigação:**
  - Deploy gradual
  - Feature flags
  - Manutenção programada
  - Comunicação prévia

## 7. Fases de Implementação

### Fase 1: Fundação (Sprint 1-2)
**Objetivo:** Criar estrutura base de Consultoria e Tenant

**Tarefas:**
1. Criar modelo `Consultoria` e migrations
2. Criar modelo `Tenant` (se não existir) e migrations
3. Adicionar campo `consultoriaId` em `Tenant`
4. Adicionar campo `consultoriaId` em `Usuario`
5. Expandir enum `tipo` de Usuario para incluir GOD e CONSULTOR
6. Criar repositories básicos
7. Criar DTOs básicos
8. Criar mappers básicos

**Entregáveis:**
- Models criados
- Migrations executadas
- Estrutura base funcionando

### Fase 2: Serviços e Lógica de Negócio (Sprint 3-4)
**Objetivo:** Implementar Application Services e regras de negócio

**Tarefas:**
1. Criar `ConsultoriaApplicationService` com CRUD
2. Criar `TenantApplicationService` com CRUD
3. Criar `TenantActivationService` (ativar/desativar)
4. Implementar validações de hierarquia
5. Implementar validação de limites
6. Implementar validação de acesso (CONSULTOR apenas seus tenants)
7. Criar controllers
8. Criar rotas

**Entregáveis:**
- Services funcionais
- Controllers funcionais
- Rotas documentadas

### Fase 3: Middleware e Segurança (Sprint 5)
**Objetivo:** Implementar controle de acesso e validações

**Tarefas:**
1. Criar `tenantActivationMiddleware`
2. Criar `consultoriaAccessMiddleware`
3. Atualizar `authMiddleware` para verificar tipo de usuário
4. Atualizar `tenantMiddleware` para integrar com ativação
5. Implementar políticas de autorização
6. Atualizar `RequirePermission` para GOD e CONSULTOR
7. Testes de segurança

**Entregáveis:**
- Middleware funcionando
- Controle de acesso implementado
- Testes de segurança passando

### Fase 4: Integração e Validação (Sprint 6)
**Objetivo:** Integrar tudo e validar funcionamento

**Tarefas:**
1. Integrar com sistema existente
2. Atualizar `BaseRepository` se necessário
3. Atualizar `TenantService` existente
4. Criar dados iniciais (GOD, consultoria raiz)
5. Testes end-to-end
6. Testes de isolamento
7. Documentação Swagger completa
8. Documentação de uso

**Entregáveis:**
- Sistema integrado
- Testes passando
- Documentação completa

### Fase 5: Funcionalidades Avançadas (Sprint 7-8)
**Objetivo:** Implementar funcionalidades adicionais

**Tarefas:**
1. Dashboard de consultoria (estatísticas agregadas)
2. Relatórios por consultoria
3. Notificações de desativação
4. Histórico de ativações/desativações
5. Exportação de dados (por consultoria)
6. API administrativa para GOD
7. Métricas e monitoramento

**Entregáveis:**
- Funcionalidades avançadas
- Dashboard funcional
- Relatórios disponíveis

## 8. Considerações de Design

### 8.1. Nomenclatura

- **Consultoria:** Entidade de nível superior que agrupa tenants
- **Tenant:** Instância isolada do sistema, pertence a uma consultoria
- **GOD:** Usuário de nível mais alto, gerencia consultorias
- **CONSULTOR:** Usuário que gerencia tenants de uma consultoria
- **ROOT/CLIENT:** Usuários normais do sistema, dentro de um tenant

### 8.2. Convenções

- Prefixo de tabelas: `C011_consultoria`, `C012_tenant` (seguindo padrão existente)
- Campos de auditoria: `usercreation`, `datecreation` (padrão existente)
- Multi-tenancy: `tenantId` em todas as tabelas de dados
- Status: `ativo` (boolean) para controle de acesso

### 8.3. Padrões de Código

- Seguir padrões existentes do projeto
- Usar `@Injectable()` em todos os services
- Usar `@RequirePermission()` para autorização
- Usar `@Auditable()` para auditoria
- Usar `@Cacheable()` e `@CacheEvict()` para cache
- Usar `@Transactional()` para transações

## 9. Métricas e Monitoramento

### 9.1. Métricas a Coletar

- Número de consultorias ativas
- Número de tenants por consultoria
- Taxa de ativação/desativação de tenants
- Uso de recursos por tenant
- Performance de queries por tenant
- Erros de acesso negado

### 9.2. Alertas

- Tenant desativado tentando acessar
- Limite de tenants próximo
- Performance degradada
- Erros de isolamento detectados

## 10. Próximos Passos

1. Revisar e aprovar arquitetura
2. Criar issues/tarefas detalhadas
3. Iniciar Fase 1 (Fundação)
4. Code review contínuo
5. Testes incrementais
6. Documentação durante desenvolvimento

---

**Documento criado em:** 2026-01-17  
**Versão:** 1.0  
**Autor:** Arquitetura WhiteLabel - Sistema RuralIn
