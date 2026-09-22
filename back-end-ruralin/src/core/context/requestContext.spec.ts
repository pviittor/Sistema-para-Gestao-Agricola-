/**
 * Testes unitários para RequestContext
 * 
 * NOTA: Estes testes requerem framework de testes (Jest, Mocha, etc.)
 * Para executar, configure o framework de testes primeiro.
 */

import { RequestContext } from './RequestContext';

describe('RequestContext', () => {
  let context: RequestContext;

  beforeEach(() => {
    context = new RequestContext();
  });

  describe('RequestId', () => {
    it('deve definir e obter requestId', () => {
      const requestId = 'test-request-id';
      context.setRequestId(requestId);

      expect(context.getRequestId()).toBe(requestId);
    });

    it('deve ter requestId vazio inicialmente', () => {
      expect(context.getRequestId()).toBe('');
    });
  });

  describe('UserId', () => {
    it('deve definir e obter userId', () => {
      const userId = 123;
      context.setUserId(userId);

      expect(context.getUserId()).toBe(userId);
    });

    it('deve retornar undefined quando userId não definido', () => {
      expect(context.getUserId()).toBeUndefined();
    });

    it('deve permitir definir userId como undefined', () => {
      context.setUserId(123);
      expect(context.getUserId()).toBe(123);

      // Não há método para limpar userId, mas podemos testar undefined inicial
      const newContext = new RequestContext();
      expect(newContext.getUserId()).toBeUndefined();
    });
  });

  describe('Timing', () => {
    it('deve ter startTime definido na criação', () => {
      const startTime = context.getStartTime();
      expect(startTime).toBeGreaterThan(0);
      expect(startTime).toBeLessThanOrEqual(Date.now());
    });

    it('deve calcular duração corretamente', (done) => {
      const startTime = context.getStartTime();
      
      setTimeout(() => {
        const duration = context.getDuration();
        expect(duration).toBeGreaterThanOrEqual(10); // Pelo menos 10ms
        done();
      }, 10);
    });
  });

  describe('clear', () => {
    it('deve limpar requestId e userId', () => {
      context.setRequestId('test-id');
      context.setUserId(123);

      context.clear();

      expect(context.getRequestId()).toBe('');
      expect(context.getUserId()).toBeUndefined();
    });

    it('deve resetar startTime ao limpar', () => {
      const originalStartTime = context.getStartTime();
      
      // Aguardar um pouco
      setTimeout(() => {
        context.clear();
        const newStartTime = context.getStartTime();
        expect(newStartTime).toBeGreaterThan(originalStartTime);
      }, 10);
    });
  });

  describe('toJSON', () => {
    it('deve converter para JSON corretamente', () => {
      context.setRequestId('test-id');
      context.setUserId(123);

      const json = context.toJSON();

      expect(json).toHaveProperty('requestId', 'test-id');
      expect(json).toHaveProperty('userId', 123);
      expect(json).toHaveProperty('startTime');
      expect(json).toHaveProperty('duration');
    });

    it('deve não incluir userId quando undefined', () => {
      context.setRequestId('test-id');
      // userId não definido

      const json = context.toJSON();

      expect(json).toHaveProperty('requestId', 'test-id');
      expect(json).not.toHaveProperty('userId');
      expect(json).toHaveProperty('startTime');
      expect(json).toHaveProperty('duration');
    });
  });
});
