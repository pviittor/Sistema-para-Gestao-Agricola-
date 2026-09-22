/**
 * Helpers para decorators de autorização
 * 
 * Funções auxiliares para obter userId de diferentes fontes
 * e validar contexto de autorização.
 */

import { RequestContext } from '../context/RequestContext';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * AsyncLocalStorage para armazenar RequestContext durante a execução da requisição
 * 
 * O middleware requestContextMiddleware deve definir o contexto aqui
 * para que os decorators possam acessá-lo.
 */
const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Define o RequestContext para o escopo assíncrono atual
 * 
 * Deve ser chamado pelo middleware requestContextMiddleware
 * 
 * @param context - RequestContext da requisição atual
 * @param callback - Função a ser executada com o contexto definido
 */
export function runWithContext<T>(context: RequestContext, callback: () => T): T {
  return requestContextStorage.run(context, callback);
}

/**
 * Obtém o RequestContext do escopo assíncrono atual
 * 
 * @returns RequestContext atual ou undefined se não estiver definido
 */
export function getRequestContext(): RequestContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Obtém o userId de diferentes fontes possíveis
 * 
 * Tenta obter userId na seguinte ordem:
 * 1. RequestContext do AsyncLocalStorage (definido pelo middleware)
 * 2. Argumentos do método (se algum for Request com context ou userId)
 * 3. RequestContext via DI container (fallback)
 * 
 * @param args - Argumentos do método decorado
 * @returns userId ou undefined se não encontrado
 */
export function getUserIdFromContext(...args: any[]): number | undefined {
  // 1. Tentar obter do AsyncLocalStorage (mais confiável)
  const context = getRequestContext();
  if (context) {
    const userId = context.getUserId();
    if (userId !== undefined) {
      return userId;
    }
  }

  // 2. Tentar obter dos argumentos (se algum for Request)
  const req = args.find(arg => 
    arg && 
    typeof arg === 'object' && 
    ('context' in arg || 'userId' in arg || 'headers' in arg)
  );
  
  if (req) {
    // Tentar req.context primeiro (RequestContext)
    if ((req as any).context && (req as any).context instanceof RequestContext) {
      const userId = (req as any).context.getUserId();
      if (userId !== undefined) {
        return userId;
      }
    }

    // Tentar req.userId (definido pelo authMiddleware)
    if ((req as any).userId !== undefined) {
      return (req as any).userId;
    }
  }

  // 3. Fallback: tentar obter do DI container (pode não funcionar se não for singleton)
  try {
    // Importar dinamicamente para evitar dependência circular
    const containerModule = require('../di/container');
    const typesModule = require('../di/types');
    const container = containerModule.container;
    const TYPES = typesModule.TYPES;
    
    if (container && TYPES) {
      const requestContext = container.resolve(TYPES.RequestContext) as RequestContext;
      if (requestContext) {
        const userId = requestContext.getUserId();
        if (userId !== undefined) {
          return userId;
        }
      }
    }
  } catch (error) {
    // RequestContext pode não estar disponível via DI
  }

  return undefined;
}
