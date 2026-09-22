# Plano: Feature Máquinas e Veículos

## Contexto

Implementar o cadastro de **GrupoEquipamento** e **Maquina** (Máquinas/Veículos) conforme spec `docs/features/feat-cadmaquina.md`. Inclui modelo de dados, CRUD completo, lógica de negócio (horímetros, depreciação, custo) e integração com entidades existentes (Pessoa, Produto, Fazenda). Próximos números de tabela: **C029** e **C030**.

---

## Enums a definir (em `src/models/enums/MaquinaEnums.ts`)

```typescript
export enum TipoMarcador { HORIMETRO = 1, ODOMETRO = 2, NENHUM = 3 }
export enum CombustivelTipo { GASOLINA = 1, DIESEL = 2, ETANOL = 3, GAS = 4, ELETRICO = 5, HIBRIDO = 6 }
export enum TipoMaquina { MAQUINA = 1, VEICULO = 2, IMPLEMENTO = 3 }
```

---

## Tarefas

### TASK 1 — GrupoEquipamento: Stack completo (Agent A, worktree isolado)

**Sem dependências. Entidade simples, padrão `GrupoProduto`.**

Arquivos a criar:

| Camada | Arquivo | Detalhes |
|--------|---------|----------|
| Migration | `src/migrations/20260224100000-create-C029_grupoEquipamento.ts` | Tabela `C029_grupoEquipamento`: `id_grpequip` (PK INT AI), `tenantId` (INT NOT NULL), `descricao_grpequip` (VARCHAR 255 NOT NULL), `usercreation` (INT FK→usuarios.id CASCADE/RESTRICT), `datecreation` (DATE DEFAULT NOW). Indexes: `tenantId`, `usercreation`. |
| Model | `src/models/GrupoEquipamento.ts` | `timestamps: false`. PK: `id_grpequip`. Campos: `tenantId`, `descricao_grpequip`, `usercreation`, `datecreation`. Associação: `belongsTo(Usuario)`. Padrão: `Fazenda.ts` (audit com usercreation/datecreation). |
| Repository Interface | `src/infrastructure/repository/IGrupoEquipamentoRepository.ts` | Extends `IRepository<GrupoEquipamento>`. Sem métodos custom. |
| Repository Impl | `src/infrastructure/repository/GrupoEquipamentoRepository.ts` | Extends `BaseRepository<GrupoEquipamento>`. Inject `ICacheService`, `ITenantService`. Override `findById` para PK `id_grpequip`. |
| DTOs | `src/application/dto/grupoEquipamento/` | **Create**: `descricao_grpequip` (@IsString, @IsNotEmpty, @MaxLength(255)). **Update**: mesmos campos com @IsOptional. **Response**: todos campos + `usuarioCriador?`. **index.ts**: barrel export. |
| Mapper | `src/application/mappers/GrupoEquipamentoMapper.ts` | `@Injectable()`. `toEntity(dto)` → mapeia descricao. `toDto(entity)` → mapeia todos campos + nested usuarioCriador. |
| Service Interface | `src/application/services/grupoEquipamento/IGrupoEquipamentoApplicationService.ts` | Extends `IApplicationService<ResponseDto, CreateDto, UpdateDto>`. |
| Service Impl | `src/application/services/grupoEquipamento/GrupoEquipamentoApplicationService.ts` | CRUD padrão. Decorators: `@RequirePermission('grupoEquipamento.*')`, `@Cacheable`, `@CacheEvict`, `@Auditable('GrupoEquipamento')`, `@Transactional()`. |
| Controller Interface | `src/controllers/interfaces/IGrupoEquipamentoController.ts` | Métodos: `index`, `show`, `create`, `update`, `delete`. |
| Controller Impl | `src/controllers/GrupoEquipamentoController.ts` | Thin HTTP handler. Inject `IGrupoEquipamentoApplicationService`. |
| Routes | `src/routes/grupoEquipamento.routes.ts` | GET `/`, GET `/:id`, POST `/`, PUT `/:id`, DELETE `/:id`. Middleware: `requirePermission`, `validateDto`, `asyncHandler`. |

**Arquivos a modificar (DI + Routes):**
- `src/core/di/types.ts` — Adicionar `IGrupoEquipamentoRepository`, `IGrupoEquipamentoApplicationService`, `IGrupoEquipamentoController`
- `src/core/di/registerRepositories.ts` — Registrar `GrupoEquipamentoRepository`
- `src/core/di/registerServices.ts` — Registrar `GrupoEquipamentoApplicationService` + `GrupoEquipamentoMapper`
- `src/core/di/registerControllers.ts` — Registrar `GrupoEquipamentoController`
- `src/routes/index.ts` — Adicionar `router.use('/gruposEquipamento', authMiddleware, tenantActivationMiddleware, grupoEquipamentoRoutes)`

**Referências**: `src/models/Fazenda.ts` (model), `src/infrastructure/repository/GrupoProdutoRepository.ts` (repo), `src/application/dto/grupoProduto/` (DTOs), `src/application/services/grupoProduto/` (service), `src/controllers/GrupoProdutoController.ts` (controller), `src/routes/grupoProduto.routes.ts` (routes).

---

### TASK 2 — Maquina: Model + Migration + Enums (Agent B, worktree isolado)

**Depende de: TASK 1 (FK para GrupoEquipamento).**

Arquivos a criar:

| Camada | Arquivo | Detalhes |
|--------|---------|----------|
| Enums | `src/models/enums/MaquinaEnums.ts` | `TipoMarcador`, `CombustivelTipo`, `TipoMaquina` (definidos acima). |
| Model | `src/models/Maquina.ts` | Tabela `C030_maquina`, PK `id_mqn`, `timestamps: false`. Todos os campos do spec convertidos para Sequelize (DECIMAL(18,4), DATEONLY, BOOLEAN, INTEGER, STRING). 6 FKs: `idGrupoEquipamento`→C029, `idFornecedor`/`idMotorista`/`idSeguradora`→C001_PESSOA, `idCombustivelMaquina`→C008_produto, `idFazenda`→C018_fazenda. Audit: `usercreation`→usuarios, `datecreation`. Associations: 6x `belongsTo`. |
| Migration | `src/migrations/20260224100001-create-C030_maquina.ts` | Todas colunas + FKs (onDelete SET NULL para opcionais, RESTRICT para usercreation). Indexes: `tenantId`, `idGrupoEquipamento`, `idFornecedor`, `idMotorista`, `idFazenda`, `placa`, `usercreation`. |

**Campos completos do Model Maquina:**
- Identificação: `id_mqn`, `tenantId`, `descricao` (NOT NULL), `chassi`, `placa`, `ano`, `modelo`, `serie`, `marca`
- Classificação: `idGrupoEquipamento` (FK), `tipoMarcador` (enum), `combustivel` (enum), `tipo` (enum)
- Aquisição: `dataAquisicao`, `valorAquisicao`, `valorAtual`, `idFornecedor` (FK), `notaFiscal`, `serieNotaFiscal`, `dataNotaFiscal`
- Depreciação: `vidaUtil`, `percsucata`, `depreciacaoAnual`, `horaUtilAno`
- Horímetros: `horimetroInicial`, `ultimoHorimetro`, `horimetroAbastecimento`, `horimetroManutencao`, `horimetroApontamento`
- Custo: `custoFixo`, `valorCustoFixo`, `valorConsumoFixo`, `custoDepreciacao`, `valorHoraDepreciacao`, `custoManutencao`, `custoCombustivel`, `valorHora`
- Combustível: `consumoEstimadoCombustivel`, `idCombustivelMaquina` (FK)
- Fazenda/Operação: `idFazenda` (FK), `idMotorista` (FK), `consumoHA`, `custoHA`
- Pesagem: `tara`, `utilizarTaraPesagem`
- Seguro: `idSeguradora` (FK), `inicioSeguro`, `fimSeguro`, `aplice`
- Auditoria: `usercreation`, `datecreation`

**Referência**: `src/models/Fazenda.ts`, `src/migrations/20260117150004-create-C018_fazenda.ts`

---

### TASK 3 — Maquina: DTOs + Mapper (Agent C, worktree isolado)

**Depende de: TASK 2 (precisa dos tipos do Model e Enums).**

Arquivos a criar:

| Camada | Arquivo | Detalhes |
|--------|---------|----------|
| CreateDto | `src/application/dto/maquina/CreateMaquinaDto.ts` | `descricao` (@IsNotEmpty). FKs opcionais com `@Validate(IsExists, ['Model', 'pk'])`: `idGrupoEquipamento`→['GrupoEquipamento','id_grpequip'], `idFornecedor`→['Pessoa','id_pessoa'], `idMotorista`→['Pessoa','id_pessoa'], `idSeguradora`→['Pessoa','id_pessoa'], `idCombustivelMaquina`→['Produto','id_prod'], `idFazenda`→['Fazenda','id']. Enums com `@IsValidEnum`. Decimais com `@IsNumber`, `@Min(0)`. Booleans com `@IsBoolean`. Dates com `@IsDateString`. Strings com `@MaxLength`. |
| UpdateDto | `src/application/dto/maquina/UpdateMaquinaDto.ts` | Mesmos campos, todos `@IsOptional`. |
| ResponseDto | `src/application/dto/maquina/MaquinaResponseDto.ts` | Todos campos + nested objects: `grupoEquipamento?`, `fornecedor?`, `motorista?`, `seguradora?`, `combustivelProduto?`, `fazenda?`, `usuarioCriador?`. |
| Index | `src/application/dto/maquina/index.ts` | Barrel export. |
| Mapper | `src/application/mappers/MaquinaMapper.ts` | `@Injectable()`. `toEntity(dto)`: mapeia todos campos, dates como string (Sequelize converte). `toDto(entity)`: mapeia todos campos + nested relationships condicionalmente. Decimais convertidos com `Number()`. |

**Referência**: `src/application/dto/fazenda/CreateFazendaDto.ts`, `src/application/mappers/FazendaMapper.ts`

---

### TASK 4 — Maquina: Repository (Agent D, worktree isolado)

**Depende de: TASK 2 (Model).**

Arquivos a criar:

| Camada | Arquivo | Detalhes |
|--------|---------|----------|
| Interface | `src/infrastructure/repository/IMaquinaRepository.ts` | Extends `IRepository<Maquina>`. Custom: `findByPlaca(placa: string): Promise<Maquina \| null>`, `findByGrupo(idGrupo: number): Promise<Maquina[]>`. |
| Implementation | `src/infrastructure/repository/MaquinaRepository.ts` | Extends `BaseRepository<Maquina>`. Override `findById`: include associations (GrupoEquipamento, Pessoa as fornecedor/motorista/seguradora, Produto, Fazenda, Usuario). Override `findAllPaginated`: include GrupoEquipamento + Fazenda (resumido). Custom `findByPlaca`: query por placa + tenant filter. Custom `findByGrupo`: query por idGrupoEquipamento + tenant. Cache patterns: `maquina:findByPlaca:*`, `maquina:findByGrupo:*`. |

**Referência**: `src/infrastructure/repository/FazendaRepository.ts`, `src/infrastructure/repository/ProdutoRepository.ts`

---

### TASK 5 — Maquina: Service + Controller + Routes + DI (Agent E, worktree isolado)

**Depende de: TASK 2, TASK 3, TASK 4 (todos os artefatos da Maquina).**

Arquivos a criar:

| Camada | Arquivo | Detalhes |
|--------|---------|----------|
| Service Interface | `src/application/services/maquina/IMaquinaApplicationService.ts` | CRUD padrão + `findByPlaca(placa)`, `getMotoristaByPlaca(placa)`, `atualizarHorimetro(id, campo, valor)`, `calcularDepreciacao(id)`, `calcularCustoMaquina(id)`. |
| Service Impl | `src/application/services/maquina/MaquinaApplicationService.ts` | Ver seção "Lógica de Negócio" abaixo. Inject: `IMaquinaRepository`, `MaquinaMapper`. Decorators: `@RequirePermission('maquina.*')`, `@Transactional`, `@Auditable('Maquina')`, `@Cacheable`, `@CacheEvict`. |
| Controller Interface | `src/controllers/interfaces/IMaquinaController.ts` | `index`, `show`, `create`, `update`, `delete`, `findByPlaca`, `getMotoristaByPlaca`, `atualizarHorimetro`, `calcularDepreciacao`, `calcularCustoMaquina`. |
| Controller Impl | `src/controllers/MaquinaController.ts` | Thin HTTP handler. Inject `IMaquinaApplicationService`. |
| Routes | `src/routes/maquina.routes.ts` | `GET /` list, `GET /placa/:placa` findByPlaca, `GET /placa/:placa/motorista` getMotorista, `GET /:id` show, `GET /:id/depreciacao` calcular, `GET /:id/custo` calcular, `POST /` create, `PUT /:id` update, `PATCH /:id/horimetro` atualizarHorimetro, `DELETE /:id` delete. |

**Arquivos a modificar (DI + Routes):**
- `src/core/di/types.ts` — `IMaquinaRepository`, `IMaquinaApplicationService`, `IMaquinaController`
- `src/core/di/registerRepositories.ts` — `MaquinaRepository`
- `src/core/di/registerServices.ts` — `MaquinaApplicationService` + `MaquinaMapper`
- `src/core/di/registerControllers.ts` — `MaquinaController`
- `src/routes/index.ts` — `router.use('/maquinas', authMiddleware, tenantActivationMiddleware, maquinaRoutes)`

### Lógica de Negócio (MaquinaApplicationService)

1. **atualizarHorimetro(id, campo, valor)**: Atualiza `horimetroAbastecimento`|`horimetroManutencao`|`horimetroApontamento` SOMENTE se `valor > valorAtual`. Também atualiza `ultimoHorimetro` se `valor > ultimoHorimetro`.

2. **calcularDepreciacao(id)**: `depreciacao = (valorAtual - (valorAtual * percsucata / 100)) / vidaUtil`. Retorna 0 se `vidaUtil === 0`. Depreciação por hora = `depreciacao / horaUtilAno` (0 se `horaUtilAno === 0`).

3. **calcularCustoMaquina(id)**: Se `custoFixo === true` → retorna `valorCustoFixo + valorConsumoFixo`. Senão, soma condicional: `custoDepreciacao` → `depreciacaoAnual / horaUtilAno`; `custoManutencao` → custo manutenção/hora; `custoCombustivel` → custo combustível/hora.

4. **findByPlaca(placa)**: Busca por placa com tenant filter.

5. **getMotoristaByPlaca(placa)**: Busca máquina por placa, retorna Pessoa (motorista) associada.

**Referência**: `src/application/services/fazenda/FazendaApplicationService.ts`, `src/controllers/FazendaController.ts`, `src/routes/fazenda.routes.ts`

---

## Grafo de Dependências

```
TASK 1 (GrupoEquipamento full stack)  ──────────────────────┐
                                                             │
TASK 2 (Maquina Model+Migration+Enums)  [depende de TASK 1] │
    ├── TASK 3 (Maquina DTOs+Mapper)                         │
    ├── TASK 4 (Maquina Repository)                          │
    └── TASK 5 (Maquina Service+Controller+Routes+DI)        │
             [depende de TASK 2, 3, 4]                       │
```

## Execução Paralela Otimizada

| Rodada | Agent A | Agent B | Agent C | Agent D | Agent E |
|--------|---------|---------|---------|---------|---------|
| 1 | TASK 1 (GrupoEquipamento) | — | — | — | — |
| 2 | — | TASK 2 (Model+Migration) | TASK 3 (DTOs+Mapper) | TASK 4 (Repository) | — |
| 3 | — | — | — | — | TASK 5 (Service+Controller+Routes+DI) |

> **Nota**: Tasks 3 e 4 podem rodar em paralelo com Task 2 se os agentes receberem as interfaces/tipos esperados na descrição da tarefa (sem precisar ler o model finalizado). Task 5 precisa de todas as anteriores completas pois importa de todos os artefatos.

## Verificação

1. `npm run build` — compilação TypeScript sem erros
2. `npm run migrate` — migration cria tabelas C029 e C030 no banco
3. Testar endpoints via Swagger (`/api-docs`):
   - CRUD GrupoEquipamento: `POST/GET/PUT/DELETE /api/gruposEquipamento`
   - CRUD Maquina: `POST/GET/PUT/DELETE /api/maquinas`
   - Busca por placa: `GET /api/maquinas/placa/:placa`
   - Atualizar horímetro: `PATCH /api/maquinas/:id/horimetro`
   - Calcular depreciação: `GET /api/maquinas/:id/depreciacao`
   - Calcular custo: `GET /api/maquinas/:id/custo`
