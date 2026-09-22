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
Examples: `plan/add-component`, `file-summary/src/views/Dashboard.vue`, `decision/state-management`, `done/crud-pedido`

## Commands

```bash
npm run dev          # Start dev server on port 4200
npm run build        # Type-check + build for production
npm run type-check   # Run vue-tsc type checking
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting on src/
npm run test:unit    # Run Vitest unit tests
npm run test:e2e:dev # Open Cypress against dev server (port 4173)
npm run test:e2e     # Run Cypress against production preview
```

To run a single Vitest test file:
```bash
npx vitest run src/path/to/file.spec.ts
```

## Architecture

**Tech stack:** Vue 3 (Composition API + `<script setup lang="ts">`), TypeScript, Vite, Pinia, Vue Router 4, Axios, Tailwind CSS v4, Lucide Vue Next, Vue3 Toastify.

**Path alias:** `@/` maps to `src/`.

**Environment variable:** `VITE_RURALIN_API_URL` sets the API base URL (defaults to `http://localhost:3000/api`).

### Directory Structure

```
src/
├── components/    # Reusable components; each domain entity has a *Modal.vue for CRUD
├── router/        # Vue Router with navigation guards (JWT-based auth)
├── services/      # Axios service layer — one file per domain entity
│   └── api.ts     # Shared Axios instance with JWT attach + token refresh interceptors
├── stores/        # Pinia stores (minimal — most state lives in component-level refs)
├── types/         # TypeScript interfaces for all domain entities
├── utils/         # formatters.ts, masks.ts (CPF/CNPJ/Phone), validators.ts
└── views/         # Page-level components; cadastros/ subdirectory for registration screens
```

### Routing & Auth

All routes under `/dashboard` are protected. The router guard in `src/router/index.ts` checks for a JWT token in `localStorage`. Unauthenticated users are redirected to `/`. Dashboard children are lazy-loaded.

### Service Layer Pattern

Each domain entity follows this structure:

```typescript
export const [entity]Service = {
  getAll: (page = 1, limit = 10) => api.get<PaginatedResult<T>>('/endpoint', { params: { page, limit } }),
  getAllNoPagination: () => api.get<T[]>('/endpoint/all'),
  getById: (id: number) => api.get<T>(`/endpoint/${id}`),
  create: (data: T) => api.post<T>('/endpoint', data),
  update: (id: number, data: Partial<T>) => api.put<T>(`/endpoint/${id}`, data),
  delete: (id: number) => api.delete(`/endpoint/${id}`),
}
```

The shared Axios instance (`src/services/api.ts`) automatically attaches `Authorization: Bearer <token>` and handles 401 responses with a queued token refresh flow (via `/auth/refresh`), retrying original requests after refresh.

### API Response Formats (IMPORTANT)

Backend controllers use **two different response formats** for paginated endpoints. Always check the controller source to determine which format applies before writing the service/view.

**Format A — Wrapped** (older controllers: `ContaController`, `SafraController`, etc.):
```typescript
// Controller: res.json({ success: true, data: result })
// Axios response.data = { success: true, data: { data: T[], page, total, totalPages } }
// Service: const { data } = await api.get<PaginatedResult<T>>(...)  →  returns { success, data: { data, page, ... } }
// View: result.data.data  (array),  result.data.page,  result.data.total
```
Use `PaginatedResult<T>` from `contaService.ts` for these.

**Format B — Unwrapped** (newer controllers: `TituloPagarController`, `TituloReceberController`, `RecorrenciaFinanceiraController`):
```typescript
// Controller: res.json(result)  — no { success, data } wrapper
// Axios response.data = { data: T[], page, total, totalPages }
// Service: const { data } = await api.get<BackendPaginatedResult<T>>(...)  →  returns { data, page, total, totalPages }
// View: result.data  (array),  result.page,  result.total
```
Define `BackendPaginatedResult<T>` locally in the service for these.

**Rule:** Always verify the backend route → controller → `res.json(...)` call to determine which format is used. Do NOT assume `result.data.data` — this is the #1 source of runtime errors.

### View + Modal Pattern

Views manage list state, search/filter, and CRUD orchestration. Each entity's modal component (`*Modal.vue`) handles create/edit forms. Standard props: `isOpen`, `initialData`, `loading`. Standard emits: `close`, `save`. Toast notifications (vue3-toastify) are used for user feedback.

### Global Safra Selector Pattern (IMPORTANT)

All dashboard views must use the global safra selector (`SafraSelectorGlobal.vue`) via the Pinia store `useSafraStore` (`stores/safra.ts`). This replaces any local safra dropdowns.

**Store**: `useSafraStore` provides `selectedSafraId` (persisted to localStorage), `safras`, `fetchSafras()`, `selectSafra()`, `init()`.

**DashboardView** renders the `SafraSelectorGlobal` component in the header and initializes the store on mount.

**How views use safra filtering:**

1. **Views with direct `idSafra` / `safraId` field** (Talhoes, OrdensServico, Custeio, Analytics, Benfeitorias, FluxoCaixa, Aging, TitulosPagar, TitulosReceber):
   - Import `useSafraStore`, read `safraStore.selectedSafraId`
   - Pass it as a query param or filter when loading data
   - Watch `safraStore.selectedSafraId` to reload on change

2. **Views with `ConfiguradorCiclo` relation** (OutrasDespesasReceitas):
   - Use `GET /api/configuradoresCiclo/fazenda/:fazendaId/safra/:safraId` to get configuradores for the selected safra
   - Filter local data by the returned configurador IDs

3. **Views without safra relation** (Contas, Usuarios, Permissões, etc.):
   - No safra filtering needed — ignore the selector

**Rules for new views:**
- **NEVER** add a local safra dropdown — always use `useSafraStore`
- **ALWAYS** add a `watch(() => safraStore.selectedSafraId, () => carregarDados())` to react to global changes
- If uncertain whether a view needs safra filtering, check if the entity has `idSafra`, `safraId`, or relates to `ConfiguradorCiclo`

### Code Style

- No semicolons, single quotes, 100-char print width (Prettier config).
- Brazilian Portuguese is used for domain terminology (talhão, propriedade, safra, etc.) and UI labels.
- Primary brand color: `lime-600`.

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
