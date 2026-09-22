/**
 * Testes unitários para DTOs de Evento
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateEventoDto } from './CreateEventoDto';
import { UpdateEventoDto } from './UpdateEventoDto';

describe('CreateEventoDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      titulo: 'Reunião de Planejamento',
      descricao: 'Reunião para planejar as atividades do mês',
      data: '2025-01-20',
      horario_inicio: '09:00:00',
      horario_fim: '11:00:00',
      localId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando título está ausente', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      descricao: 'Descrição do evento',
      data: '2025-01-20',
      horario_inicio: '09:00:00',
      horario_fim: '11:00:00',
      localId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'titulo')).toBe(true);
  });

  it('deve rejeitar data inválida', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      titulo: 'Evento',
      descricao: 'Descrição',
      data: 'data-invalida',
      horario_inicio: '09:00:00',
      horario_fim: '11:00:00',
      localId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'data')).toBe(true);
  });

  it('deve rejeitar horário de início inválido', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      titulo: 'Evento',
      descricao: 'Descrição',
      data: '2025-01-20',
      horario_inicio: '25:00:00', // Hora inválida
      horario_fim: '11:00:00',
      localId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'horario_inicio')).toBe(true);
  });

  it('deve rejeitar horário de fim anterior ao início', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      titulo: 'Evento',
      descricao: 'Descrição',
      data: '2025-01-20',
      horario_inicio: '11:00:00',
      horario_fim: '09:00:00', // Antes do início
      localId: 1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'horario_fim')).toBe(true);
  });

  it('deve rejeitar localId inválido', async () => {
    const dto = plainToInstance(CreateEventoDto, {
      titulo: 'Evento',
      descricao: 'Descrição',
      data: '2025-01-20',
      horario_inicio: '09:00:00',
      horario_fim: '11:00:00',
      localId: 0, // ID inválido
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'localId')).toBe(true);
  });
});

describe('UpdateEventoDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      titulo: 'Reunião Atualizada',
      descricao: 'Nova descrição',
      data: '2025-01-21',
      horario_inicio: '10:00:00',
      horario_fim: '12:00:00',
      localId: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO com apenas alguns campos (atualização parcial)', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      titulo: 'Título Atualizado',
      // Apenas título, outros campos opcionais
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdateEventoDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar horário de fim anterior ao início quando ambos fornecidos', async () => {
    const dto = plainToInstance(UpdateEventoDto, {
      horario_inicio: '11:00:00',
      horario_fim: '09:00:00', // Antes do início
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'horario_fim')).toBe(true);
  });
});
