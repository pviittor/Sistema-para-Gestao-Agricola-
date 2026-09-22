/**
 * Testes unitários para DTOs de Permissão
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePermissaoDto } from './CreatePermissaoDto';
import { UpdatePermissaoDto } from './UpdatePermissaoDto';

describe('CreatePermissaoDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'usuarios.criar',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar nome com formato correto', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'eventos.editar',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando nome está ausente', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {});

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome muito curto', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'us', // Menos de 3 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome muito longo', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'a'.repeat(101), // Mais de 100 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome com caracteres inválidos', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'usuarios@criar', // @ não permitido
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve rejeitar nome com letras maiúsculas', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'Usuarios.Criar', // Maiúsculas não permitidas
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });

  it('deve aceitar nome com números', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'recurso123.acao456',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar nome com underscore e hífen', async () => {
    const dto = plainToInstance(CreatePermissaoDto, {
      nome: 'recurso_acao.acao-teste',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

describe('UpdatePermissaoDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdatePermissaoDto, {
      nome: 'usuarios.atualizar',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdatePermissaoDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar nome com caracteres inválidos quando fornecido', async () => {
    const dto = plainToInstance(UpdatePermissaoDto, {
      nome: 'usuarios@atualizar', // @ não permitido
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'nome')).toBe(true);
  });
});
