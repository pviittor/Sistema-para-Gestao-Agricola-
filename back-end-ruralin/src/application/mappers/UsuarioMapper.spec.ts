/**
 * Testes unitários para UsuarioMapper
 * 
 * Estes testes verificam a conversão entre DTOs e entidades,
 * garantindo que dados sensíveis não sejam expostos e que
 * transformações sejam aplicadas corretamente.
 */

import { UsuarioMapper } from './UsuarioMapper';
import Usuario from '../../models/Usuario';
import { CreateUsuarioDto, UsuarioTipo } from '../dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto } from '../dto/usuario/UsuarioResponseDto';
import bcrypt from 'bcryptjs';

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}));

describe('UsuarioMapper', () => {
  let mapper: UsuarioMapper;

  beforeEach(() => {
    mapper = new UsuarioMapper();
    jest.clearAllMocks();
  });

  describe('toEntity', () => {
    it('deve converter CreateUsuarioDto para entidade', async () => {
      const mockHash = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const dto: CreateUsuarioDto = {
        nome: 'João Silva',
        username: 'joao.silva',
        email: 'joao@example.com',
        senha: 'Senha123',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
      };

      const entity = await mapper.toEntity(dto);

      expect(entity).toEqual({
        nome: 'João Silva',
        username: 'joao.silva',
        email: 'joao@example.com',
        whatsapp: '+5511999999999',
        tipo: UsuarioTipo.ROOT,
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
        senha: mockHash,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Senha123', 10);
    });

    it('deve converter UpdateUsuarioDto para entidade (campos opcionais)', async () => {
      const dto: UpdateUsuarioDto = {
        nome: 'João Silva Atualizado',
        email: 'novoemail@example.com',
      };

      const entity = await mapper.toEntity(dto);

      expect(entity).toEqual({
        nome: 'João Silva Atualizado',
        email: 'novoemail@example.com',
      });

      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('deve aplicar hash de senha apenas se fornecida', async () => {
      const mockHash = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const dto: UpdateUsuarioDto = {
        nome: 'João Silva',
        senha: 'NovaSenha123',
      };

      const entity = await mapper.toEntity(dto);

      expect(entity.senha).toBe(mockHash);
      expect(bcrypt.hash).toHaveBeenCalledWith('NovaSenha123', 10);
    });

    it('não deve incluir senha se não fornecida', async () => {
      const dto: UpdateUsuarioDto = {
        nome: 'João Silva',
      };

      const entity = await mapper.toEntity(dto);

      expect(entity.senha).toBeUndefined();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('toDto', () => {
    it('deve converter entidade para DTO sem senha', () => {
      const entity = {
        id: 1,
        nome: 'João Silva',
        username: 'joao.silva',
        email: 'joao@example.com',
        whatsapp: '+5511999999999',
        tipo: 'ROOT',
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
        senha: 'hashed_password', // Senha não deve aparecer no DTO
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14'),
      } as Usuario;

      const dto = mapper.toDto(entity);

      expect(dto).toEqual({
        id: 1,
        nome: 'João Silva',
        username: 'joao.silva',
        email: 'joao@example.com',
        whatsapp: '+5511999999999',
        tipo: 'ROOT',
        apiKey: 'key123',
        apiUrl: 'https://api.example.com',
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14'),
      });

      // Verificar que senha NÃO está no DTO
      expect((dto as any).senha).toBeUndefined();
    });

    it('deve incluir todos os campos da entidade exceto senha', () => {
      const entity = {
        id: 2,
        nome: 'Maria Santos',
        username: 'maria.santos',
        email: 'maria@example.com',
        whatsapp: '+5511888888888',
        tipo: 'CLIENT',
        apiKey: 'key456',
        apiUrl: 'https://api2.example.com',
        senha: 'secret_hash',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
      } as Usuario;

      const dto = mapper.toDto(entity);

      expect(dto.id).toBe(2);
      expect(dto.nome).toBe('Maria Santos');
      expect(dto.email).toBe('maria@example.com');
      expect((dto as any).senha).toBeUndefined();
    });
  });
});
