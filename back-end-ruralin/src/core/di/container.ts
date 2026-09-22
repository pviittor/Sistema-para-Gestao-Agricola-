/**
 * Container de Dependency Injection
 * 
 * Este arquivo configura e exporta o container de DI usando TSyringe.
 * O container é responsável por gerenciar o ciclo de vida e resolução
 * de todas as dependências do sistema.
 * 
 * IMPORTANTE: Importar 'reflect-metadata' no início do arquivo é obrigatório
 * para que os decorators funcionem corretamente.
 */

import 'reflect-metadata';
import { container as tsyringeContainer, DependencyContainer } from 'tsyringe';
import { TYPES } from './types';

/**
 * Container principal de Dependency Injection
 * 
 * Este é o container global do TSyringe. Todas as dependências
 * devem ser registradas e resolvidas através deste container.
 */
export const container: DependencyContainer = tsyringeContainer;

/**
 * Inicializa o container de DI
 * 
 * Esta função deve ser chamada no início da aplicação, antes de
 * qualquer resolução de dependências. Aqui serão registradas
 * todas as dependências do sistema.
 * 
 * @example
 * ```typescript
 * import { initializeContainer } from './core/di/container';
 * 
 * initializeContainer();
 * ```
 */
export function initializeContainer(): void {
  // Registrar services primeiro (Logger, etc.)
  const { registerServices } = require('./registerServices');
  registerServices();
  
  // Registrar repositories
  const { registerRepositories } = require('./registerRepositories');
  registerRepositories();
  
  // Registrar controllers
  const { registerControllers } = require('./registerControllers');
  registerControllers();
  
  // Registrar políticas de autorização padrão
  const { registerDefaultPolicies } = require('../authorization/registerPolicies');
  registerDefaultPolicies();
  
  // Aqui serão registradas outras dependências conforme forem implementadas
  // Exemplo futuro:
  // container.registerSingleton<IAuthService>(TYPES.IAuthService, AuthService);
  
  console.log('Dependency Injection container initialized');
}

/**
 * Limpa o container de DI
 * 
 * Útil para testes, permite resetar o container entre testes.
 */
export function clearContainer(): void {
  container.clearInstances();
}

// Exportar tipos para uso externo
export { TYPES };
export { container as default };
