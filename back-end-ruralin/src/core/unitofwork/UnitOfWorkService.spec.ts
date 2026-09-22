/**
 * Testes unitários para UnitOfWorkService
 * 
 * Estes testes verificam o comportamento do Unit of Work Service,
 * incluindo criação de transações, commit em sucesso e rollback em erros.
 */

import { UnitOfWorkService } from './UnitOfWorkService';
import { IUnitOfWork } from './IUnitOfWork';
import { Transaction } from 'sequelize';
import sequelize from '../../config/database';

// Mock do Sequelize
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
  },
}));

describe('UnitOfWorkService', () => {
  let service: IUnitOfWork;
  let mockTransaction: jest.Mocked<Transaction>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Criar mock de transação
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(undefined),
      rollback: jest.fn().mockResolvedValue(undefined),
    } as any;

    // Mock do sequelize.transaction
    (sequelize.transaction as jest.Mock) = jest.fn().mockResolvedValue(mockTransaction);

    // Criar instância do service
    service = new UnitOfWorkService();
  });

  describe('execute', () => {
    it('deve criar transação, executar função e fazer commit em sucesso', async () => {
      // Arrange
      const expectedResult = { id: 1, nome: 'Teste' };
      const fn = jest.fn().mockResolvedValue(expectedResult);

      // Act
      const result = await service.execute(fn);

      // Assert
      expect(sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(mockTransaction);
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('deve fazer rollback e propagar erro quando função lança exceção', async () => {
      // Arrange
      const error = new Error('Erro de teste');
      const fn = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(service.execute(fn)).rejects.toThrow('Erro de teste');

      expect(sequelize.transaction).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(mockTransaction);
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });

    it('deve passar transação para função executada', async () => {
      // Arrange
      const fn = jest.fn().mockResolvedValue('resultado');

      // Act
      await service.execute(fn);

      // Assert
      expect(fn).toHaveBeenCalledWith(mockTransaction);
    });

    it('deve retornar resultado da função executada', async () => {
      // Arrange
      const expectedResult = { data: 'teste' };
      const fn = jest.fn().mockResolvedValue(expectedResult);

      // Act
      const result = await service.execute(fn);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('deve fazer rollback mesmo se commit falhar', async () => {
      // Arrange
      const commitError = new Error('Erro no commit');
      mockTransaction.commit.mockRejectedValue(commitError);
      const fn = jest.fn().mockResolvedValue('resultado');

      // Act & Assert
      await expect(service.execute(fn)).rejects.toThrow('Erro no commit');

      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
    });

    it('deve fazer rollback mesmo se rollback falhar', async () => {
      // Arrange
      const rollbackError = new Error('Erro no rollback');
      mockTransaction.rollback.mockRejectedValue(rollbackError);
      const error = new Error('Erro na função');
      const fn = jest.fn().mockRejectedValue(error);

      // Act & Assert
      // O erro original deve ser propagado, não o erro do rollback
      await expect(service.execute(fn)).rejects.toThrow('Erro na função');

      expect(mockTransaction.rollback).toHaveBeenCalledTimes(1);
    });

    it('deve suportar funções assíncronas', async () => {
      // Arrange
      const fn = jest.fn().mockImplementation(async (transaction: Transaction) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'resultado assíncrono';
      });

      // Act
      const result = await service.execute(fn);

      // Assert
      expect(result).toBe('resultado assíncrono');
      expect(mockTransaction.commit).toHaveBeenCalledTimes(1);
    });

    it('deve criar nova transação para cada chamada', async () => {
      // Arrange
      const fn1 = jest.fn().mockResolvedValue('resultado1');
      const fn2 = jest.fn().mockResolvedValue('resultado2');

      // Act
      await service.execute(fn1);
      await service.execute(fn2);

      // Assert
      expect(sequelize.transaction).toHaveBeenCalledTimes(2);
      expect(fn1).toHaveBeenCalledTimes(1);
      expect(fn2).toHaveBeenCalledTimes(1);
    });
  });
});
