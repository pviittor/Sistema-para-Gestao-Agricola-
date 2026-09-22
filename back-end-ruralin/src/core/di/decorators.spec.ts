/**
 * Testes unitários para decorators de Dependency Injection
 * 
 * Estes testes validam que os decorators customizados funcionam
 * corretamente e mantêm compatibilidade com TSyringe.
 */

import 'reflect-metadata';
import { container, clearContainer, Injectable, Inject, TYPES } from './index';

// Interfaces e classes de teste
interface ITestService {
  getName(): string;
}

interface ILogger {
  log(message: string): void;
}

@Injectable()
class TestService implements ITestService {
  getName(): string {
    return 'TestService';
  }
}

@Injectable({ scope: 'transient' })
class TransientService implements ITestService {
  private id: number;

  constructor() {
    this.id = Math.random();
  }

  getName(): string {
    return `TransientService-${this.id}`;
  }
}

@Injectable()
class LoggerService implements ILogger {
  private logs: string[] = [];

  log(message: string): void {
    this.logs.push(message);
  }

  getLogs(): string[] {
    return this.logs;
  }
}

@Injectable()
class ServiceWithDependency implements ITestService {
  constructor(
    @Inject(TYPES.ILogger) private logger: ILogger
  ) {}

  getName(): string {
    return 'ServiceWithDependency';
  }

  getLogger(): ILogger {
    return this.logger;
  }
}

@Injectable()
class ServiceWithClassInjection implements ITestService {
  constructor(
    private logger: LoggerService
  ) {}

  getName(): string {
    return 'ServiceWithClassInjection';
  }

  getLogger(): LoggerService {
    return this.logger;
  }
}

/**
 * Função de validação dos decorators
 */
export function validateDecorators(): void {
  console.log('Validando decorators de DI...');

  try {
    clearContainer();

    // Teste 1: @Injectable() deve registrar classe
    const instance1 = container.resolve(TestService);
    if (!instance1 || instance1.getName() !== 'TestService') {
      throw new Error('@Injectable() não está funcionando');
    }
    console.log('✅ @Injectable() funcionando');

    // Teste 2: Singleton por padrão
    clearContainer();
    const singleton1 = container.resolve(TestService);
    const singleton2 = container.resolve(TestService);
    if (singleton1 !== singleton2) {
      throw new Error('Singleton não está funcionando');
    }
    console.log('✅ Singleton funcionando');

    // Teste 3: Transient scope
    clearContainer();
    const transient1 = container.resolve(TransientService);
    const transient2 = container.resolve(TransientService);
    if (transient1 === transient2) {
      throw new Error('Transient não está funcionando');
    }
    console.log('✅ Transient scope funcionando');

    // Teste 4: @Inject com token
    clearContainer();
    container.registerSingleton<ILogger>(TYPES.ILogger, LoggerService);
    
    const serviceWithDep = container.resolve(ServiceWithDependency);
    if (!serviceWithDep.getLogger()) {
      throw new Error('@Inject não está funcionando');
    }
    console.log('✅ @Inject com token funcionando');

    // Teste 5: Injeção automática por classe
    clearContainer();
    const serviceWithClass = container.resolve(ServiceWithClassInjection);
    if (!serviceWithClass.getLogger()) {
      throw new Error('Injeção automática por classe não está funcionando');
    }
    console.log('✅ Injeção automática por classe funcionando');

    // Teste 6: Múltiplas dependências
    clearContainer();
    container.registerSingleton<ILogger>(TYPES.ILogger, LoggerService);
    
    const service1 = container.resolve(ServiceWithDependency);
    const service2 = container.resolve(ServiceWithDependency);
    
    // Deve ser a mesma instância de logger (singleton)
    if (service1.getLogger() !== service2.getLogger()) {
      throw new Error('Dependências singleton não estão sendo compartilhadas');
    }
    console.log('✅ Múltiplas dependências funcionando');

    console.log('\n✅ Todos os testes dos decorators passaram!');
  } catch (error) {
    console.error('❌ Erro na validação dos decorators:', error);
    throw error;
  }
}

// Executar validação se arquivo for executado diretamente
if (require.main === module) {
  validateDecorators();
}
