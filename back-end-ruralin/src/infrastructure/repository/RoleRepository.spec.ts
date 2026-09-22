/**
 * Testes unitários para RoleRepository
 * 
 * Estes testes verificam os métodos customizados do RoleRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model } from 'sequelize';
import { RoleRepository } from './RoleRepository';
import Role from '../../models/Role';

// Mock do modelo Role
jest.mock('../../models/Role', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('RoleRepository', () => {
  let repository: RoleRepository;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    // Resetar mocks
    jest.clearAllMocks();

    // Mock do método findOne do BaseRepository
    mockFindOne = jest.fn();
    
    // Criar instância do repositório
    repository = new RoleRepository();
    
    // Substituir método findOne do BaseRepository
    (repository as any).findOne = mockFindOne;
  });

  describe('findByNome', () => {
    it('deve retornar role quando encontrada', async () => {
      const mockRole = { id: 1, nome: 'ADMIN' } as Role;

      mockFindOne.mockResolvedValue(mockRole);

      const result = await repository.findByNome('ADMIN');

      expect(result).toBe(mockRole);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { nome: 'ADMIN' },
      });
    });

    it('deve retornar null quando role não encontrada', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByNome('INEXISTENTE');

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { nome: 'INEXISTENTE' },
      });
    });

    it('deve fazer busca case-sensitive', async () => {
      mockFindOne.mockResolvedValue(null);

      await repository.findByNome('admin');

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { nome: 'admin' },
      });
    });
  });

  describe('Métodos herdados do BaseRepository', () => {
    it('deve ter acesso aos métodos do BaseRepository', () => {
      // Verificar que os métodos do BaseRepository estão disponíveis
      expect(repository.findById).toBeDefined();
      expect(repository.findAll).toBeDefined();
      expect(repository.create).toBeDefined();
      expect(repository.update).toBeDefined();
      expect(repository.delete).toBeDefined();
    });
  });
});
