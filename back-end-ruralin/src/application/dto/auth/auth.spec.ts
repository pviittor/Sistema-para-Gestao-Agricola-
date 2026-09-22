/**
 * Testes unitários para DTOs de Autenticação
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLoginDto } from './CreateLoginDto';
import { RefreshTokenDto } from './RefreshTokenDto';

describe('CreateLoginDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateLoginDto, {
      email: 'usuario@example.com',
      senha: 'senha123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar email inválido', async () => {
    const dto = plainToInstance(CreateLoginDto, {
      email: 'email-invalido',
      senha: 'senha123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('deve rejeitar email vazio', async () => {
    const dto = plainToInstance(CreateLoginDto, {
      email: '',
      senha: 'senha123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'email')).toBe(true);
  });

  it('deve rejeitar senha muito curta', async () => {
    const dto = plainToInstance(CreateLoginDto, {
      email: 'usuario@example.com',
      senha: '12345', // Menos de 6 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar senha vazia', async () => {
    const dto = plainToInstance(CreateLoginDto, {
      email: 'usuario@example.com',
      senha: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'senha')).toBe(true);
  });

  it('deve rejeitar quando campos estão ausentes', async () => {
    const dto = plainToInstance(CreateLoginDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('RefreshTokenDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar refresh token vazio', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
  });

  it('deve rejeitar quando refresh token está ausente', async () => {
    const dto = plainToInstance(RefreshTokenDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'refreshToken')).toBe(true);
  });

  it('deve rejeitar refresh token que não é string', async () => {
    const dto = plainToInstance(RefreshTokenDto, {
      refreshToken: 12345,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'refreshToken')).toBe(true);
  });
});
