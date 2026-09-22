/**
 * Testes unitários para LembreteRepository
 * 
 * Estes testes verificam os métodos customizados do LembreteRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model } from 'sequelize';
import { LembreteRepository } from './LembreteRepository';
import Lembrete from '../../models/Lembrete';
import LembreteDataHora from '../../models/LembreteDataHora';

// Mock dos modelos
jest.mock('../../models/Lembrete', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

jest.mock('../../models/LembreteDataHora', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('LembreteRepository', () => {
  let repository: LembreteRepository;
  let mockFindAll: jest.Mock;
  let mockModelFindAll: jest.Mock;

  beforeEach(() => {
    // Resetar mocks
    jest.clearAllMocks();

    // Mock do método findAll do BaseRepository
    mockFindAll = jest.fn();
    
    // Mock do findAll do modelo
    mockModelFindAll = jest.fn();
    (Lembrete as any).findAll = mockModelFindAll;
    
    // Criar instância do repositório
    repository = new LembreteRepository();
    
    // Substituir método findAll do BaseRepository
    (repository as any).findAll = mockFindAll;
    (repository as any).model = Lembrete;
  });

  describe('findByUsuario', () => {
    it('deve retornar lembretes do usuário quando encontrados', async () => {
      const mockLembretes = [
        { id: 1, usuarioId: 1, desc_simples: 'Lembrete 1' },
        { id: 2, usuarioId: 1, desc_simples: 'Lembrete 2' },
      ] as Lembrete[];

      mockFindAll.mockResolvedValue(mockLembretes);

      const result = await repository.findByUsuario(1);

      expect(result).toBe(mockLembretes);
      expect(mockFindAll).toHaveBeenCalledWith({
        where: { usuarioId: 1 },
        include: [
          {
            model: LembreteDataHora,
            as: 'lembrete_data_hora',
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    });

    it('deve retornar array vazio quando não há lembretes do usuário', async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await repository.findByUsuario(999);

      expect(result).toEqual([]);
      expect(mockFindAll).toHaveBeenCalledWith({
        where: { usuarioId: 999 },
        include: [
          {
            model: LembreteDataHora,
            as: 'lembrete_data_hora',
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });
    });
  });

  describe('findProximos', () => {
    it('deve retornar próximos lembretes quando encontrados', async () => {
      const mockLembretes = [
        { id: 1, desc_simples: 'Lembrete 1', lembrete_data_hora: [] },
        { id: 2, desc_simples: 'Lembrete 2', lembrete_data_hora: [] },
      ] as Lembrete[];

      mockModelFindAll.mockResolvedValue(mockLembretes);

      const result = await repository.findProximos(5);

      expect(result).toBe(mockLembretes);
      expect(mockModelFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: LembreteDataHora,
              as: 'lembrete_data_hora',
              required: true,
            }),
          ]),
          limit: 5,
        })
      );
    });

    it('deve usar limite padrão de 10 quando não especificado', async () => {
      mockModelFindAll.mockResolvedValue([]);

      await repository.findProximos();

      expect(mockModelFindAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 10,
        })
      );
    });

    it('deve filtrar lembretes com data >= hoje ou com dia definido', async () => {
      mockModelFindAll.mockResolvedValue([]);

      await repository.findProximos(5);

      const callArgs = mockModelFindAll.mock.calls[0][0];
      const includeWhere = callArgs.include[0].where;

      expect(includeWhere).toBeDefined();
      expect(includeWhere[Symbol.for('or')]).toBeDefined();
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
