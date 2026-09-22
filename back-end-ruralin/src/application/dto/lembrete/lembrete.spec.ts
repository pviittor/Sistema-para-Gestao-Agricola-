/**
 * Testes unitários para DTOs de Lembrete
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateLembreteDto } from './CreateLembreteDto';
import { UpdateLembreteDto } from './UpdateLembreteDto';
import { CreateLembreteDataHoraDto } from './CreateLembreteDataHoraDto';

describe('CreateLembreteDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_simples: 'Reunião importante',
      desc_completa: 'Reunião com a equipe para discutir o planejamento',
      lembrete_data_hora: [
        {
          dia: 'Segunda-feira',
          data: '2025-01-20',
          horario: '09:00:00',
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO sem lembrete_data_hora', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_simples: 'Reunião importante',
      desc_completa: 'Reunião com a equipe',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando desc_simples está ausente', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_completa: 'Descrição completa',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_simples')).toBe(true);
  });

  it('deve rejeitar quando desc_completa está ausente', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_simples: 'Descrição simples',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'desc_completa')).toBe(true);
  });

  it('deve rejeitar lembrete_data_hora com horário inválido', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_simples: 'Reunião',
      desc_completa: 'Descrição',
      lembrete_data_hora: [
        {
          horario: '25:00:00', // Hora inválida
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'lembrete_data_hora')).toBe(true);
  });

  it('deve rejeitar lembrete_data_hora com data inválida', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_simples: 'Reunião',
      desc_completa: 'Descrição',
      lembrete_data_hora: [
        {
          data: 'data-invalida',
          horario: '09:00:00',
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'lembrete_data_hora')).toBe(true);
  });

  it('deve rejeitar lembrete_data_hora vazio', async () => {
    const dto = plainToInstance(CreateLembreteDto, {
      desc_simples: 'Reunião',
      desc_completa: 'Descrição',
      lembrete_data_hora: [],
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'lembrete_data_hora')).toBe(true);
  });
});

describe('CreateLembreteDataHoraDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(CreateLembreteDataHoraDto, {
      dia: 'Segunda-feira',
      data: '2025-01-20',
      horario: '09:00:00',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO apenas com horário', async () => {
    const dto = plainToInstance(CreateLembreteDataHoraDto, {
      horario: '09:00:00',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando horário está ausente', async () => {
    const dto = plainToInstance(CreateLembreteDataHoraDto, {
      dia: 'Segunda-feira',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'horario')).toBe(true);
  });

  it('deve rejeitar horário inválido', async () => {
    const dto = plainToInstance(CreateLembreteDataHoraDto, {
      horario: '25:00:00', // Hora inválida
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'horario')).toBe(true);
  });
});

describe('UpdateLembreteDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdateLembreteDto, {
      desc_simples: 'Reunião Atualizada',
      desc_completa: 'Nova descrição',
      lembrete_data_hora: [
        {
          data: '2025-01-21',
          horario: '10:00:00',
        },
      ],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO com apenas alguns campos (atualização parcial)', async () => {
    const dto = plainToInstance(UpdateLembreteDto, {
      desc_simples: 'Reunião Atualizada',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdateLembreteDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });
});
