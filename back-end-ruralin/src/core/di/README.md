# Dependency Injection Module

Módulo de Dependency Injection usando TSyringe.

## Uso Básico

### 1. Marcar classe como injetável

```typescript
import { Injectable } from '../core/di';

@Injectable()
export class MyService {
  // ...
}
```

### 2. Injetar dependências

```typescript
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';

@Injectable()
export class MyService {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}
}
```

### 3. Registrar dependências

```typescript
import { container, TYPES } from '../core/di';
import { LoggerService } from './services/LoggerService';

container.registerSingleton<ILogger>(TYPES.ILogger, LoggerService);
```

### 4. Resolver dependências

```typescript
import { container, TYPES } from '../core/di';

const logger = container.resolve<ILogger>(TYPES.ILogger);
```

## Estrutura

- `container.ts`: Container principal e inicialização
- `decorators.ts`: Decorators customizados
- `types.ts`: Tokens de DI
- `index.ts`: Exports principais

## Documentação Completa

Ver: `documentos/features/T1.1-Setup-Container-DI.md`
