/**
 * Barrel export para módulo de Dependency Injection
 * 
 * Exporta todos os componentes do módulo DI para facilitar imports.
 */

export { container, initializeContainer, clearContainer, TYPES } from './container';
export { Injectable, Inject } from './decorators';
export { TYPES as DITypes } from './types';
