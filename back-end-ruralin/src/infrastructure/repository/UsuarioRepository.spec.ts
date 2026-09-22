/**
 * Testes unitários para UsuarioRepository
 * 
 * Estes testes verificam os métodos customizados do UsuarioRepository
 * além dos métodos herdados do BaseRepository.
 */

import { Model } from 'sequelize';
import { UsuarioRepository } from './UsuarioRepository';
import Usuario from '../../models/Usuario';

// Mock do modelo Usuario
jest.mock('../../models/Usuario', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('UsuarioRepository', () => {
  let repository: UsuarioRepository;
  let mockFindOne: jest.Mock;

  beforeEach(() => {
    // Resetar mocks
    jest.clearAllMocks();

    // Mock do método findOne do BaseRepository
    mockFindOne = jest.fn();
    
    // Criar instância do repositório
    repository = new UsuarioRepository();
    
    // Substituir método findOne do BaseRepository
    (repository as any).findOne = mockFindOne;
  });

  describe('findByEmail', () => {
    it('deve retornar usuário quando encontrado por email', async () => {
      const mockUsuario = {
        id: 1,
        email: 'usuario@example.com',
        nome: 'Usuário Teste',
      } as Usuario;

      mockFindOne.mockResolvedValue(mockUsuario);

      const result = await repository.findByEmail('usuario@example.com');

      expect(result).toBe(mockUsuario);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: 'usuario@example.com' },
      });
    });

    it('deve retornar null quando usuário não encontrado por email', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByEmail('inexistente@example.com');

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { email: 'inexistente@example.com' },
      });
    });
  });

  describe('findByUsername', () => {
    it('deve retornar usuário quando encontrado por username', async () => {
      const mockUsuario = {
        id: 1,
        username: 'joao.silva',
        nome: 'João Silva',
      } as Usuario;

      mockFindOne.mockResolvedValue(mockUsuario);

      const result = await repository.findByUsername('joao.silva');

      expect(result).toBe(mockUsuario);
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { username: 'joao.silva' },
      });
    });

    it('deve retornar null quando usuário não encontrado por username', async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await repository.findByUsername('usuario.inexistente');

      expect(result).toBeNull();
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { username: 'usuario.inexistente' },
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
