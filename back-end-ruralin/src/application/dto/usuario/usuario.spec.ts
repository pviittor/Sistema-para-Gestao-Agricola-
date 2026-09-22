/**
 * Testes unitários para DTOs de Usuário
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUsuarioDto, UsuarioTipo } from './CreateUsuarioDto';
import { UpdateUsuarioDto } from './UpdateUsuarioDto';

describe('CreateUsuarioDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      email: 'joao@example.com',
      username: 'joao.silva',
      senha: 'Senha123',
      whatsapp: '+5511999999999',
      tipo: UsuarioTipo.ROOT,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
      roleIds: [1, 2],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar email inválido', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      email: 'email-invalido',
      username: 'joao.silva',
      senha: 'Senha123',
      whatsapp: '+5511999999999',
      tipo: UsuarioTipo.ROOT,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar senha muito curta', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      email: 'joao@example.com',
      username: 'joao.silva',
      senha: '12345', // Menos de 8 caracteres
      whatsapp: '+5511999999999',
      tipo: UsuarioTipo.ROOT,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar senha sem maiúscula', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      email: 'joao@example.com',
      username: 'joao.silva',
      senha: 'senha123', // Sem maiúscula
      whatsapp: '+5511999999999',
      tipo: UsuarioTipo.ROOT,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar senha sem número', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      email: 'joao@example.com',
      username: 'joao.silva',
      senha: 'SenhaABC', // Sem número
      whatsapp: '+5511999999999',
      tipo: UsuarioTipo.ROOT,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar tipo inválido', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      email: 'joao@example.com',
      username: 'joao.silva',
      senha: 'Senha123',
      whatsapp: '+5511999999999',
      tipo: 'INVALID_TYPE' as any,
      apiKey: 'key123',
      apiUrl: 'https://api.example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'tipo')).toBe(true);
  });

  it('deve rejeitar quando campos obrigatórios estão ausentes', async () => {
    const dto = plainToInstance(CreateUsuarioDto, {
      nome: 'João Silva',
      // email ausente
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateUsuarioDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdateUsuarioDto, {
      nome: 'João Silva Atualizado',
      email: 'novoemail@example.com',
      username: 'joao.silva.novo',
      senha: 'NovaSenha123',
      whatsapp: '+5511888888888',
      tipo: UsuarioTipo.CLIENT,
      apiKey: 'newkey123',
      apiUrl: 'https://newapi.example.com',
      roleIds: [3, 4],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO com apenas alguns campos (atualização parcial)', async () => {
    const dto = plainToInstance(UpdateUsuarioDto, {
      nome: 'João Silva Atualizado',
      // Apenas nome, outros campos opcionais
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar email inválido', async () => {
    const dto = plainToInstance(UpdateUsuarioDto, {
      email: 'email-invalido',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar senha muito curta', async () => {
    const dto = plainToInstance(UpdateUsuarioDto, {
      senha: '12345', // Menos de 8 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdateUsuarioDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });
});
