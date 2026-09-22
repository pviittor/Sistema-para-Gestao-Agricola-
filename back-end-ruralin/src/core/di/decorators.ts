/**
 * Decorators customizados para Dependency Injection
 * 
 * Estes decorators são wrappers sobre os decorators do TSyringe,
 * permitindo padronização e extensão futura se necessário.
 * 
 * @module core/di/decorators
 */

import { 
  injectable as tsyringeInjectable, 
  inject as tsyringeInject, 
  InjectionToken
} from 'tsyringe';

/**
 * Opções para o decorator @Injectable
 */
export interface InjectableOptions {
  /**
   * Escopo da instância
   * - 'singleton': Uma única instância compartilhada (padrão)
   * - 'transient': Nova instância a cada resolução
   */
  scope?: 'singleton' | 'transient';
  
  /**
   * Token customizado para registro
   * Se não fornecido, a classe será usada como token
   */
  token?: InjectionToken<any>;
}

/**
 * Decorator para marcar uma classe como injetável
 * 
 * Este decorator registra a classe no container de DI, permitindo
 * que seja injetada em outras classes.
 * 
 * @param options - Opções de configuração (opcional)
 * @returns Decorator function
 * 
 * @example
 * ```typescript
 * // Singleton (padrão)
 * @Injectable()
 * export class MyService {
 *   // ...
 * }
 * 
 * // Transient (nova instância a cada vez)
 * @Injectable({ scope: 'transient' })
 * export class MyTransientService {
 *   // ...
 * }
 * 
 * // Com token customizado
 * @Injectable({ token: TYPES.IMyService })
 * export class MyService implements IMyService {
 *   // ...
 * }
 * ```
 */
export function Injectable(options?: InjectableOptions | 'singleton' | 'transient') {
  return function (target: any) {
    // Suportar sintaxe curta: @Injectable('transient')
    const opts: InjectableOptions = typeof options === 'string' 
      ? { scope: options }
      : (options || {});

    const scope = opts.scope || 'singleton';

    // Registrar com TSyringe
    // TSyringe usa singleton por padrão, para transient precisamos registrar manualmente
    tsyringeInjectable()(target);

    // Se token customizado fornecido, registrar com esse token
    if (opts.token) {
      const { container } = require('./container');
      if (scope === 'singleton') {
        container.registerSingleton(opts.token, target);
      } else {
        container.register(opts.token, { useClass: target });
      }
    } else if (scope === 'transient') {
      // Para transient sem token, registrar a classe como transient
      const { container } = require('./container');
      container.register(target, { useClass: target });
    }
  };
}

/**
 * Decorator para injetar uma dependência no construtor
 * 
 * Este decorator marca um parâmetro do construtor para injeção
 * automática pelo container de DI.
 * 
 * @param token - Token da dependência (string, Symbol, classe ou token do TYPES)
 * @returns Decorator function para parâmetro
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @Inject(TYPES.ILogger) private logger: ILogger,
 *     @Inject(TYPES.ICacheService) private cache: ICacheService
 *   ) {}
 * }
 * 
 * // Injeção por classe (resolução automática)
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     private logger: LoggerService  // TSyringe resolve automaticamente
 *   ) {}
 * }
 * ```
 */
export function Inject(token: InjectionToken<any>) {
  return tsyringeInject(token);
}

/**
 * Decorator para injeção opcional
 * 
 * Permite injetar uma dependência que pode não estar registrada.
 * Retorna undefined se a dependência não for encontrada.
 * 
 * NOTA: TSyringe não suporta injeção opcional nativamente.
 * Este decorator é um placeholder para futura implementação.
 * Por enquanto, use try-catch ao resolver ou verifique se está registrado.
 * 
 * @param token - Token da dependência
 * @returns Decorator function para parâmetro
 * 
 * @example
 * ```typescript
 * @Injectable()
 * export class MyService {
 *   constructor(
 *     @Optional(TYPES.ILogger) private logger?: ILogger
 *   ) {
 *     if (this.logger) {
 *       this.logger.log('Logger disponível');
 *     }
 *   }
 * }
 * ```
 */
export function Optional(token: InjectionToken<any>) {
  // Por enquanto, apenas aplica @Inject
  // Futura implementação: verificar se token existe antes de injetar
  return tsyringeInject(token);
}
