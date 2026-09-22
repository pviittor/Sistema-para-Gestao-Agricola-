/**
 * Teste básico do container de Dependency Injection
 * 
 * Este arquivo contém validação básica para verificar que o container
 * de DI está funcionando corretamente.
 * 
 * Para executar: node -r ts-node/register src/core/di/container.test.ts
 * Ou configurar Jest/Mocha conforme preferência da equipe.
 */

import 'reflect-metadata';
import { container, clearContainer, Injectable, Inject, TYPES } from './index';

// Classe de teste para validação
interface ITestService {
  getName(): string;
}

@Injectable()
class TestService implements ITestService {
  getName(): string {
    return 'TestService';
  }
}

/**
 * Função de validação básica
 * Executa testes básicos do container de DI
 */
export function validateContainer(): void {
  console.log('Validando container de DI...');

  try {
    // Teste 1: Container deve ser criado
    if (!container) {
      throw new Error('Container não foi criado');
    }
    console.log('✅ Container criado corretamente');

    // Teste 2: Deve registrar e resolver uma classe simples
    container.register<ITestService>('ITestService', { useClass: TestService });
    const instance = container.resolve<ITestService>('ITestService');
    
    if (!instance || instance.getName() !== 'TestService') {
      throw new Error('Falha ao resolver dependência');
    }
    console.log('✅ Resolução de dependência funcionando');

    // Teste 3: Deve criar instância singleton por padrão
    clearContainer();
    container.register<ITestService>('ITestService', { useClass: TestService });
    const instance1 = container.resolve<ITestService>('ITestService');
    const instance2 = container.resolve<ITestService>('ITestService');
    
    if (instance1 !== instance2) {
      throw new Error('Singleton não está funcionando');
    }
    console.log('✅ Singleton funcionando corretamente');

    // Teste 4: Decorator @Injectable deve funcionar
    clearContainer();
    const testInstance = container.resolve(TestService);
    
    if (!testInstance || testInstance.getName() !== 'TestService') {
      throw new Error('Decorator @Injectable não está funcionando');
    }
    console.log('✅ Decorator @Injectable funcionando');

    console.log('\n✅ Todos os testes do container de DI passaram!');
  } catch (error) {
    console.error('❌ Erro na validação do container:', error);
    throw error;
  }
}

// Executar validação se arquivo for executado diretamente
if (require.main === module) {
  validateContainer();
}
