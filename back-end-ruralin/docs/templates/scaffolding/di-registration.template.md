# Template: DI Registration

## Arquivo: `src/core/di/types.ts`

Adicionar os seguintes tokens:

```typescript
export const TYPES = {
  // ... tokens existentes ...
  
  // Repository
  I{{EntityName}}Repository: Symbol.for('I{{EntityName}}Repository'),
  
  // Application Service
  I{{EntityName}}ApplicationService: Symbol.for('I{{EntityName}}ApplicationService'),
  
  // Controller
  I{{EntityName}}Controller: Symbol.for('I{{EntityName}}Controller'),
} as const;
```

## Arquivo: `src/core/di/registerRepositories.ts`

Adicionar registro:

```typescript
// TODO: Importar
// import { {{EntityName}}Repository } from '../../infrastructure/repository/{{EntityName}}Repository';
// import { I{{EntityName}}Repository } from '../../infrastructure/repository/I{{EntityName}}Repository';

// TODO: Registrar
// container.registerSingleton<I{{EntityName}}Repository>(TYPES.I{{EntityName}}Repository, {{EntityName}}Repository);
```

## Arquivo: `src/core/di/registerServices.ts`

Adicionar registro:

```typescript
// TODO: Importar
// import { {{EntityName}}ApplicationService } from '../../application/services/{{entityName}}/{{EntityName}}ApplicationService';
// import { I{{EntityName}}ApplicationService } from '../../application/services/{{entityName}}/I{{EntityName}}ApplicationService';
// import { {{EntityName}}Mapper } from '../../application/mappers/{{EntityName}}Mapper';

// TODO: Registrar
// container.registerSingleton<I{{EntityName}}ApplicationService>(
//   TYPES.I{{EntityName}}ApplicationService,
//   {{EntityName}}ApplicationService
// );
// container.registerSingleton<{{EntityName}}Mapper>({{EntityName}}Mapper);
```

## Arquivo: `src/core/di/registerControllers.ts`

Adicionar registro:

```typescript
// TODO: Importar
// import { {{EntityName}}Controller } from '../../controllers/{{EntityName}}Controller';
// import { I{{EntityName}}Controller } from '../../controllers/interfaces/I{{EntityName}}Controller';

// TODO: Registrar
// container.registerSingleton<I{{EntityName}}Controller>(TYPES.I{{EntityName}}Controller, {{EntityName}}Controller);
```

## Arquivo: `src/routes/index.ts`

Adicionar registro de rotas:

```typescript
// TODO: Importar
// import {{entityName}}Routes from './{{entityName}}.routes';

// TODO: Registrar
// router.use('/api/{{entityName}}s', {{entityName}}Routes);
```
