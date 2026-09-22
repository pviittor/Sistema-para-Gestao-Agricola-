/**
 * UnitOfWorkService - Implementação do Unit of Work Pattern
 * 
 * Este serviço gerencia transações de banco de dados automaticamente,
 * garantindo atomicidade de operações em Application Services.
 * 
 * Características:
 * - Cria transações automaticamente
 * - Faz commit automático em sucesso
 * - Faz rollback automático em caso de erro
 * - Suporta transações aninhadas (reutiliza transação existente)
 * - Integrado com DI container
 * 
 * @example
 * ```typescript
 * const unitOfWork = container.resolve<IUnitOfWork>(TYPES.IUnitOfWork);
 * 
 * const result = await unitOfWork.execute(async (transaction) => {
 *   const usuario = await usuarioRepository.create(dto, { transaction });
 *   const evento = await eventoRepository.create(eventoDto, { transaction });
 *   return { usuario, evento };
 * });
 * ```
 */

import { Injectable } from '../di';
import { IUnitOfWork } from './IUnitOfWork';
import { Transaction } from 'sequelize';
import sequelize from '../../config/database';

/**
 * Implementação do Unit of Work Service
 * 
 * Gerencia transações de banco de dados usando Sequelize,
 * garantindo atomicidade de operações.
 */
@Injectable()
export class UnitOfWorkService implements IUnitOfWork {
  /**
   * Executa uma função dentro de uma transação de banco de dados
   * 
   * Cria uma nova transação, executa a função fornecida, e automaticamente:
   * - Faz commit se a função executar com sucesso
   * - Faz rollback se a função lançar uma exceção
   * 
   * @template T - Tipo de retorno da função
   * @param fn - Função a ser executada dentro da transação
   * @returns Promise que resolve com o resultado da função
   * 
   * @throws Qualquer erro lançado pela função será propagado após rollback
   */
  async execute<T>(fn: (transaction: Transaction) => Promise<T>): Promise<T> {
    // Criar nova transação
    const transaction = await sequelize.transaction();

    try {
      // Executar função dentro da transação
      const result = await fn(transaction);

      // Se executou com sucesso, fazer commit
      await transaction.commit();

      return result;
    } catch (error) {
      // Se ocorreu erro, fazer rollback
      await transaction.rollback();

      // Propagar erro após rollback
      throw error;
    }
  }
}
