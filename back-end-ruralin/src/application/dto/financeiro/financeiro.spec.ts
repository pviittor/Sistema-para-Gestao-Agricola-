/**
 * Testes unitários para DTOs de Financeiro
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateFinanceiroDto } from './CreateFinanceiroDto';
import { UpdateFinanceiroDto } from './UpdateFinanceiroDto';

describe('CreateFinanceiroDto', () => {
  it('deve validar DTO válido', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-25',
      valor: 1500.50,
      contaId: 1,
      historicoId: 2,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO com valor negativo (despesa)', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-25',
      valor: -500.00, // Despesa
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar quando dataEmissao está ausente', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataVencimento: '2025-01-25',
      valor: 1500.50,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'dataEmissao')).toBe(true);
  });

  it('deve rejeitar quando dataVencimento está ausente', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      valor: 1500.50,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'dataVencimento')).toBe(true);
  });

  it('deve rejeitar quando valor está ausente', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-25',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'valor')).toBe(true);
  });

  it('deve rejeitar data de vencimento anterior à data de emissão', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-25',
      dataVencimento: '2025-01-20', // Antes da emissão
      valor: 1500.50,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'dataVencimento')).toBe(true);
  });

  it('deve aceitar data de vencimento igual à data de emissão', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-20', // Igual à emissão
      valor: 1500.50,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar data inválida', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: 'data-invalida',
      dataVencimento: '2025-01-25',
      valor: 1500.50,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'dataEmissao')).toBe(true);
  });

  it('deve rejeitar valor não numérico', async () => {
    const dto = plainToInstance(CreateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-25',
      valor: 'não é número' as any,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'valor')).toBe(true);
  });
});

describe('UpdateFinanceiroDto', () => {
  it('deve validar DTO válido com todos os campos', async () => {
    const dto = plainToInstance(UpdateFinanceiroDto, {
      dataEmissao: '2025-01-20',
      dataVencimento: '2025-01-25',
      valor: 2000.00,
      contaId: 2,
      observacao: 'Atualizado',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve validar DTO com apenas alguns campos (atualização parcial)', async () => {
    const dto = plainToInstance(UpdateFinanceiroDto, {
      valor: 2000.00,
      // Apenas valor, outros campos opcionais
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve aceitar DTO vazio (nenhuma atualização)', async () => {
    const dto = plainToInstance(UpdateFinanceiroDto, {});

    const errors = await validate(dto);
    // DTO vazio é válido (todos os campos são opcionais)
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar data de vencimento anterior à data de emissão quando ambas fornecidas', async () => {
    const dto = plainToInstance(UpdateFinanceiroDto, {
      dataEmissao: '2025-01-25',
      dataVencimento: '2025-01-20', // Antes da emissão
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.property === 'dataVencimento')).toBe(true);
  });

  it('deve aceitar apenas dataVencimento sem dataEmissao', async () => {
    const dto = plainToInstance(UpdateFinanceiroDto, {
      dataVencimento: '2025-01-30',
      // Sem dataEmissao
    });

    const errors = await validate(dto);
    // Validação de IsDateAfter não deve ser aplicada se dataEmissao não fornecida
    expect(errors.length).toBe(0);
  });
});
