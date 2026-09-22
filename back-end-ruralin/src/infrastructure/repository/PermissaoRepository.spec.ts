/**
 * Testes unitários para PermissaoRepository
 * 
 * Estes testes verificam os métodos customizados do PermissaoRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model } from 'sequelize';
import { PermissaoRepository } from './PermissaoRepository';
import Permissao from '../../models/Permissao';

// Mock do modelo Permissao
jest.mock('../../models/Permissao', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('PermissaoRepository', () => {
  let repository: PermissaoRepository;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    // Resetar mocks
    jest.clearAllMocks();

    // Mock do método findOne do BaseRepository
    mockFindOne = jest.fn();
    
    // Criar instância do repositório
    repository = new PermissaoRepository();
    
    // Substituir método findOne do BaseRepository
    (repository as any).findOne = mockFindOne;
  });

  describe('findByNome', () => {
    it('deve retornar permissão quando encontrada', async () => {
      const mockPermissao = { id: 1, nome: 'usuario:create' } as Permissao;

      mockFindOne.mockResolvedValue(mockPermissao);

      const result = await repository.findByNome('usuario:create');

      expect(result).toBe(mockPermissao);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { nome: 'usuario:create' },
      });
    });

    it('deve retornar null quando permissão não encontrada', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByNome('inexistente:action');

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { nome: 'inexistente:action' },
      });
    });

    it('deve fazer busca case-sensitive', async () => {
      mockFindOne.mockResolvedValue(null);

      await repository.findByNome('Usuario:Create');

      expect(mockFindOne).toHaveBeenCalledWith({
        where: { nome: 'Usuario:Create' },
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
