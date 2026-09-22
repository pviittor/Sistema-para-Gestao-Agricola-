/**
 * Testes unitários para DTOs de Local
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLocalDto } from './CreateLocalDto';
import { UpdateLocalDto } from './UpdateLocalDto';

describe('CreateLocalDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateLocalDto, {
      desc_simples: 'Sala de Reuniões',
      desc_completa: 'Sala de reuniões principal no primeiro andar, capacidade para 20 pessoas',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando desc_simples está ausente', async () => {
    const dto = plainToInstance(CreateLocalDto, {
      desc_completa: 'Descrição completa',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_simples')).toBe(true);
  });

  it('deve rejeitar quando desc_completa está ausente', async () => {
    const dto = plainToInstance(CreateLocalDto, {
      desc_simples: 'Sala',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_completa')).toBe(true);
  });

  it('deve rejeitar desc_simples muito curta', async () => {
    const dto = plainToInstance(CreateLocalDto, {
      desc_simples: 'Sa', // Menos de 3 caracteres
      desc_completa: 'Descrição completa do local',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_simples')).toBe(true);
  });

  it('deve rejeitar desc_simples muito longa', async () => {
    const dto = plainToInstance(CreateLocalDto, {
      desc_simples: 'A'.repeat(256), // Mais de 255 caracteres
      desc_completa: 'Descrição completa do local',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_simples')).toBe(true);
  });

  it('deve rejeitar desc_completa muito curta', async () => {
    const dto = plainToInstance(CreateLocalDto, {
      desc_simples: 'Sala de Reuniões',
      desc_completa: 'Curta', // Menos de 10 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_completa')).toBe(true);
  });
});

describe('UpdateLocalDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdateLocalDto, {
      desc_simples: 'Sala Atualizada',
      desc_completa: 'Nova descrição completa do local atualizado',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO com apenas alguns campos (atualização parcial)', async () => {
    const dto = plainToInstance(UpdateLocalDto, {
      desc_simples: 'Sala Atualizada',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdateLocalDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar desc_simples muito curta quando fornecida', async () => {
    const dto = plainToInstance(UpdateLocalDto, {
      desc_simples: 'Sa', // Menos de 3 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_simples')).toBe(true);
  });

  it('deve rejeitar desc_completa muito curta quando fornecida', async () => {
    const dto = plainToInstance(UpdateLocalDto, {
      desc_completa: 'Curta', // Menos de 10 caracteres
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_completa')).toBe(true);
  });
});
