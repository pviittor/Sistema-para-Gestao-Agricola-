/**
 * Testes unitários para DTOs de Role
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateRoleDto } from './CreateRoleDto';
import { UpdateRoleDto } from './UpdateRoleDto';

describe('CreateRoleDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateRoleDto, {
      nome: 'Administrador',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando nome está ausente', async () => {
    const dto = plainToInstance(CreateRoleDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome muito curto', async () => {
    const dto = plainToInstance(CreateRoleDto, {
      nome: 'Ad', // Menos de 3 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome muito longo', async () => {
    const dto = plainToInstance(CreateRoleDto, {
      nome: 'A'.repeat(101), // Mais de 100 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });
});

describe('UpdateRoleDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdateRoleDto, {
      nome: 'Administrador Atualizado',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdateRoleDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar nome muito curto quando fornecido', async () => {
    const dto = plainToInstance(UpdateRoleDto, {
      nome: 'Ad', // Menos de 3 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });
});
