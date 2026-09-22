/**
 * Testes unitários para classes de exceção customizadas
 */

import {
  BaseException,
  BusinessException,
  ValidationException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from './index';

describe('BaseException', () => {
  it('deve criar uma exceção base com todas as propriedades', () => {
    class TestException extends BaseException {
      constructor(message: string) {
        super(message, 500, 'TEST_ERROR', { test: true });
      }
    }

    const exception = new TestException('Teste de erro');

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe('Teste de erro');
    expect(exception.statusCode).toBe(500);
    expect(exception.code).toBe('TEST_ERROR');
    expect(exception.details).toEqual({ test: true });
    expect(exception.name).toBe('TestException');
  });

  it('deve ter stack trace', () => {
    class TestException extends BaseException {
      constructor(message: string) {
        super(message, 500, 'TEST_ERROR');
      }
    }

    const exception = new TestException('Teste');
    expect(exception.stack).toBeDefined();
  });

  it('deve converter para JSON corretamente', () => {
    class TestException extends BaseException {
      constructor(message: string) {
        super(message, 500, 'TEST_ERROR', { key: 'value' });
      }
    }

    const exception = new TestException('Teste');
    const json = exception.toJSON();

    expect(json).toEqual({
      name: 'TestException',
      message: 'Teste',
      statusCode: 500,
      code: 'TEST_ERROR',
      details: { key: 'value' },
    });
  });

  it('deve converter para JSON sem details quando não fornecido', () => {
    class TestException extends BaseException {
      constructor(message: string) {
        super(message, 500, 'TEST_ERROR');
      }
    }

    const exception = new TestException('Teste');
    const json = exception.toJSON();

    expect(json.details).toBeUndefined();
  });
});

describe('BusinessException', () => {
  it('deve criar uma BusinessException com valores padrão', () => {
    const exception = new BusinessException('Erro de negócio');

    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe('Erro de negócio');
    expect(exception.statusCode).toBe(400);
    expect(exception.code).toBe('BUSINESS_ERROR');
  });

  it('deve criar uma BusinessException com código customizado', () => {
    const exception = new BusinessException(
      'Saldo insuficiente',
      'INSUFFICIENT_BALANCE'
    );

    expect(exception.code).toBe('INSUFFICIENT_BALANCE');
    expect(exception.statusCode).toBe(400);
  });

  it('deve criar uma BusinessException com details', () => {
    const details = { saldo: 100, valor: 200 };
    const exception = new BusinessException(
      'Saldo insuficiente',
      'INSUFFICIENT_BALANCE',
      details
    );

    expect(exception.details).toEqual(details);
  });
});

describe('ValidationException', () => {
  it('deve criar uma ValidationException com valores padrão', () => {
    const exception = new ValidationException();

    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe('Dados de entrada inválidos');
    expect(exception.statusCode).toBe(400);
    expect(exception.code).toBe('VALIDATION_ERROR');
  });

  it('deve criar uma ValidationException com mensagem customizada', () => {
    const exception = new ValidationException('Email inválido');

    expect(exception.message).toBe('Email inválido');
  });

  it('deve criar uma ValidationException com código customizado', () => {
    const exception = new ValidationException(
      'Email inválido',
      'INVALID_EMAIL'
    );

    expect(exception.code).toBe('INVALID_EMAIL');
  });

  it('deve criar uma ValidationException com array de erros', () => {
    const errors = [
      { field: 'email', message: 'Email inválido' },
      { field: 'senha', message: 'Senha muito curta' },
    ];
    const exception = new ValidationException(
      'Dados inválidos',
      'VALIDATION_ERROR',
      errors
    );

    expect(exception.details).toEqual(errors);
  });
});

describe('NotFoundException', () => {
  it('deve criar uma NotFoundException sem ID', () => {
    const exception = new NotFoundException('Usuário');

    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe('Usuário não encontrado');
    expect(exception.statusCode).toBe(404);
    expect(exception.code).toBe('NOT_FOUND');
    expect(exception.details).toEqual({ resource: 'Usuário', id: undefined });
  });

  it('deve criar uma NotFoundException com ID numérico', () => {
    const exception = new NotFoundException('Usuário', 123);

    expect(exception.message).toBe('Usuário com id 123 não encontrado');
    expect(exception.details).toEqual({ resource: 'Usuário', id: 123 });
  });

  it('deve criar uma NotFoundException com ID string', () => {
    const exception = new NotFoundException('Produto', 'abc-123');

    expect(exception.message).toBe('Produto com id abc-123 não encontrado');
    expect(exception.details).toEqual({ resource: 'Produto', id: 'abc-123' });
  });

  it('deve criar uma NotFoundException com código customizado', () => {
    const exception = new NotFoundException('Configuração', undefined, 'CONFIG_NOT_FOUND');

    expect(exception.code).toBe('CONFIG_NOT_FOUND');
  });
});

describe('UnauthorizedException', () => {
  it('deve criar uma UnauthorizedException com valores padrão', () => {
    const exception = new UnauthorizedException();

    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe('Não autorizado');
    expect(exception.statusCode).toBe(401);
    expect(exception.code).toBe('UNAUTHORIZED');
  });

  it('deve criar uma UnauthorizedException com mensagem customizada', () => {
    const exception = new UnauthorizedException('Token inválido');

    expect(exception.message).toBe('Token inválido');
  });

  it('deve criar uma UnauthorizedException com código customizado', () => {
    const exception = new UnauthorizedException(
      'Credenciais inválidas',
      'INVALID_CREDENTIALS'
    );

    expect(exception.code).toBe('INVALID_CREDENTIALS');
  });

  it('deve criar uma UnauthorizedException com details', () => {
    const details = { token: 'expired' };
    const exception = new UnauthorizedException(
      'Token expirado',
      'TOKEN_EXPIRED',
      details
    );

    expect(exception.details).toEqual(details);
  });
});

describe('ForbiddenException', () => {
  it('deve criar uma ForbiddenException com valores padrão', () => {
    const exception = new ForbiddenException();

    expect(exception).toBeInstanceOf(BaseException);
    expect(exception.message).toBe('Acesso negado');
    expect(exception.statusCode).toBe(403);
    expect(exception.code).toBe('FORBIDDEN');
  });

  it('deve criar uma ForbiddenException com mensagem customizada', () => {
    const exception = new ForbiddenException(
      'Você não tem permissão para esta ação'
    );

    expect(exception.message).toBe('Você não tem permissão para esta ação');
  });

  it('deve criar uma ForbiddenException com código customizado', () => {
    const exception = new ForbiddenException(
      'Acesso negado',
      'ACCESS_DENIED'
    );

    expect(exception.code).toBe('ACCESS_DENIED');
  });

  it('deve criar uma ForbiddenException com details', () => {
    const details = { requiredPermission: 'usuario.delete' };
    const exception = new ForbiddenException(
      'Permissão insuficiente',
      'INSUFFICIENT_PERMISSION',
      details
    );

    expect(exception.details).toEqual(details);
  });
});

describe('Hierarquia de Exceções', () => {
  it('todas as exceções devem estender BaseException', () => {
    expect(new BusinessException('test')).toBeInstanceOf(BaseException);
    expect(new ValidationException('test')).toBeInstanceOf(BaseException);
    expect(new NotFoundException('test')).toBeInstanceOf(BaseException);
    expect(new UnauthorizedException('test')).toBeInstanceOf(BaseException);
    expect(new ForbiddenException('test')).toBeInstanceOf(BaseException);
  });

  it('todas as exceções devem estender Error', () => {
    expect(new BusinessException('test')).toBeInstanceOf(Error);
    expect(new ValidationException('test')).toBeInstanceOf(Error);
    expect(new NotFoundException('test')).toBeInstanceOf(Error);
    expect(new UnauthorizedException('test')).toBeInstanceOf(Error);
    expect(new ForbiddenException('test')).toBeInstanceOf(Error);
  });
});
