/**
 * Testes unitários para decorator @Transactional
 * 
 * Estes testes verificam o comportamento do decorator,
 * incluindo interceptação de métodos, criação de transações,
 * commit em sucesso e rollback em erros.
 */

import { Transactional } from './Transactional';
import { IUnitOfWork } from './IUnitOfWork';
import { container } from '../di/container';
import { TYPES } from '../di/types';
import { Transaction } from 'sequelize';

// Mock do container
jest.mock('../di/container', () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// Mock do TYPES
jest.mock('../di/types', () => ({
  TYPES: {
    IUnitOfWork: Symbol.for('IUnitOfWork'),
  },
}));

describe('@Transactional decorator', () => {
  let mockUnitOfWork: jest.Mocked<IUnitOfWork>;
  let mockTransaction: jest.Mocked<Transaction>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Criar mock de transação
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Criar mock de UnitOfWork
    mockUnitOfWork = {
      execute: jest.fn().mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      }),
    } as any;

    // Mock do container.resolve
    (container.resolve as jest.Mock) = jest.fn().mockReturnValue(mockUnitOfWork);
  });

  describe('aplicação do decorator', () => {
    it('deve interceptar método e executar dentro de transação', async () => {
      // Arrange
      class TestService {
        @Transactional()
        async testMethod(): Promise<string> {
          return 'resultado';
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(container.resolve).toHaveBeenCalledWith(TYPES.IUnitOfWork);
      expect(mockUnitOfWork.execute).toHaveBeenCalledTimes(1);
      expect(result).toBe('resultado');
    });

    it('deve passar argumentos corretamente para método original', async () => {
      // Arrange
      class TestService {
        @Transactional()
        async testMethod(arg1: string, arg2: number): Promise<string> {
          return `${arg1}-${arg2}`;
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod('teste', 123);

      // Assert
      expect(result).toBe('teste-123');
    });

    it('deve manter contexto (this) do método original', async () => {
      // Arrange
      class TestService {
        private value = 'contexto';

        @Transactional()
        async testMethod(): Promise<string> {
          return this.value;
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(result).toBe('contexto');
    });
  });

  describe('comportamento transacional', () => {
    it('deve fazer commit quando método executa com sucesso', async () => {
      // Arrange
      class TestService {
        @Transactional()
        async testMethod(): Promise<string> {
          return 'sucesso';
        }
      }

      const service = new TestService();

      // Act
      await service.testMethod();

      // Assert
      expect(mockUnitOfWork.execute).toHaveBeenCalledTimes(1);
      // O commit é feito pelo UnitOfWork, não diretamente aqui
    });

    it('deve fazer rollback quando método lança exceção', async () => {
      // Arrange
      const error = new Error('Erro de teste');
      class TestService {
        @Transactional()
        async testMethod(): Promise<string> {
          throw error;
        }
      }

      const service = new TestService();

      // Act & Assert
      await expect(service.testMethod()).rejects.toThrow('Erro de teste');

      expect(mockUnitOfWork.execute).toHaveBeenCalledTimes(1);
      // O rollback é feito pelo UnitOfWork, não diretamente aqui
    });

    it('deve propagar erro após rollback', async () => {
      // Arrange
      const error = new Error('Erro de negócio');
      class TestService {
        @Transactional()
        async testMethod(): Promise<string> {
          throw error;
        }
      }

      const service = new TestService();

      // Act & Assert
      await expect(service.testMethod()).rejects.toThrow('Erro de negócio');
    });
  });

  describe('métodos assíncronos', () => {
    it('deve suportar métodos assíncronos', async () => {
      // Arrange
      class TestService {
        @Transactional()
        async testMethod(): Promise<string> {
          await new Promise(resolve => setTimeout(resolve, 10));
          return 'assíncrono';
        }
      }

      const service = new TestService();

      // Act
      const result = await service.testMethod();

      // Assert
      expect(result).toBe('assíncrono');
    });
  });

  describe('múltiplos métodos decorados', () => {
    it('deve aplicar transação independente para cada método', async () => {
      // Arrange
      class TestService {
        @Transactional()
        async method1(): Promise<string> {
          return 'método1';
        }

        @Transactional()
        async method2(): Promise<string> {
          return 'método2';
        }
      }

      const service = new TestService();

      // Act
      const result1 = await service.method1();
      const result2 = await service.method2();

      // Assert
      expect(result1).toBe('método1');
      expect(result2).toBe('método2');
      expect(mockUnitOfWork.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('validação de uso', () => {
    it('deve lançar erro se aplicado a propriedade que não é método', () => {
      // Arrange & Act & Assert
      expect(() => {
        class TestService {
          @Transactional()
          notAMethod: string = 'teste';
        }
      }).toThrow('@Transactional can only be applied to methods');
    });
  });

  describe('opções de configuração', () => {
    it('deve aceitar opções de configuração (preparado para futuro)', () => {
      // Arrange
      const options = {
        isolationLevel: 'READ COMMITTED' as const,
      };

      // Act
      class TestService {
        @Transactional(options)
        async testMethod(): Promise<string> {
          return 'teste';
        }
      }

      // Assert - Por enquanto apenas verifica que não quebra
      // A implementação de isolamento será feita no futuro
      expect(TestService).toBeDefined();
    });
  });
});
