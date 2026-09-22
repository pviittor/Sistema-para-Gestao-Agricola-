/**
 * Testes unitários para LocalRepository
 * 
 * Estes testes verificam os métodos customizados do LocalRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model } from 'sequelize';
import { LocalRepository } from './LocalRepository';
import Local from '../../models/Local';

// Mock do modelo Local
jest.mock('../../models/Local', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('LocalRepository', () => {
  let repository: LocalRepository;
  let mockFindAll: jest.Mock;

  beforeEach(() => {
    // Resetar mocks
    jest.clearAllMocks();

    // Mock do método findAll do BaseRepository
    mockFindAll = jest.fn();
    
    // Criar instância do repositório
    repository = new LocalRepository();
    
    // Substituir método findAll do BaseRepository
    (repository as any).findAll = mockFindAll;
  });

  describe('findByUsuario', () => {
    it('deve retornar locais do usuário quando encontrados', async () => {
      const mockLocais = [
        { id: 1, usuarioId: 1, desc_simples: 'Local 1', desc_completa: 'Descrição completa 1' },
        { id: 2, usuarioId: 1, desc_simples: 'Local 2', desc_completa: 'Descrição completa 2' },
      ] as Local[];

      mockFindAll.mockResolvedValue(mockLocais);

      const result = await repository.findByUsuario(1);

      expect(result).toBe(mockLocais);
      expect(mockFindAll).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        order: [['desc_simples', 'ASC']],
      });
    });

    it('deve retornar array vazio quando não há locais do usuário', async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await repository.findByUsuario(999);

      expect(result).toEqual([]);
      expect(mockFindAll).toHaveBeenCalledWith({
        where: { usuarioId: 999 },
        order: [['desc_simples', 'ASC']],
      });
    });

    it('deve ordenar locais por desc_simples em ordem crescente', async () => {
      const mockLocais = [
        { id: 2, usuarioId: 1, desc_simples: 'B Local', desc_completa: 'Descrição B' },
        { id: 1, usuarioId: 1, desc_simples: 'A Local', desc_completa: 'Descrição A' },
      ] as Local[];

      mockFindAll.mockResolvedValue(mockLocais);

      const result = await repository.findByUsuario(1);

      expect(result).toBe(mockLocais);
      expect(mockFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [['desc_simples', 'ASC']],
        })
      );
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
