/**
 * Exemplos de uso do ErrorHandler Middleware
 * 
 * Este arquivo contém exemplos de como usar o ErrorHandler
 * e as exceções customizadas no projeto.
 * 
 * NOTA: Este arquivo é apenas para documentação/exemplos, não deve ser
 * importado em produção.
 */

import { Request, Response } from 'express';
import { asyncHandler } from './errorHandler';
import {
  BusinessException,
  ValidationException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '../core/exceptions';

// ============================================
// EXEMPLO 1: Usando asyncHandler para rotas assíncronas
// ============================================

export const exemploRotaAssincrona = asyncHandler(
  async (req: Request, res: Response) => {
    // Se ocorrer um erro aqui, será automaticamente capturado pelo ErrorHandler
    const usuario = await buscarUsuario(req.params.id);
    res.json(usuario);
  }
);

// ============================================
// EXEMPLO 2: Lançando BusinessException
// ============================================

export const exemploBusinessException = asyncHandler(
  async (req: Request, res: Response) => {
    const { saldo, valor } = req.body;

    if (saldo < valor) {
      throw new BusinessException(
        'Saldo insuficiente',
        'INSUFFICIENT_BALANCE',
        { saldo, valor }
      );
    }

    // Processar transferência...
    res.json({ success: true });
  }
);

// ============================================
// EXEMPLO 3: Lançando ValidationException
// ============================================

export const exemploValidationException = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, senha } = req.body;
    const errors: Array<{ field: string; message: string }> = [];

    if (!email || !isValidEmail(email)) {
      errors.push({ field: 'email', message: 'Email inválido' });
    }

    if (!senha || senha.length < 8) {
      errors.push({ field: 'senha', message: 'Senha deve ter no mínimo 8 caracteres' });
    }

    if (errors.length > 0) {
      throw new ValidationException('Dados inválidos', 'VALIDATION_ERROR', errors);
    }

    // Criar usuário...
    res.status(201).json({ success: true });
  }
);

// ============================================
// EXEMPLO 4: Lançando NotFoundException
// ============================================

export const exemploNotFoundException = asyncHandler(
  async (req: Request, res: Response) => {
    const usuario = await buscarUsuario(req.params.id);

    if (!usuario) {
      throw new NotFoundException('Usuário', req.params.id);
    }

    res.json(usuario);
  }
);

// ============================================
// EXEMPLO 5: Lançando UnauthorizedException
// ============================================

export const exemploUnauthorizedException = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.headers.authorization;

    if (!token || !isValidToken(token)) {
      throw new UnauthorizedException('Token inválido ou expirado', 'INVALID_TOKEN');
    }

    // Processar autenticação...
    res.json({ success: true });
  }
);

// ============================================
// EXEMPLO 6: Lançando ForbiddenException
// ============================================

export const exemploForbiddenException = asyncHandler(
  async (req: Request, res: Response) => {
    const user = (req as any).user;

    if (!user.hasPermission('usuario.delete')) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar usuários',
        'INSUFFICIENT_PERMISSION',
        { requiredPermission: 'usuario.delete' }
      );
    }

    // Deletar usuário...
    res.status(204).send();
  }
);

// ============================================
// EXEMPLO 7: Tratamento de Erro Genérico
// ============================================

export const exemploErroGenerico = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      // Alguma operação que pode falhar
      await operacaoRiscosa();
      res.json({ success: true });
    } catch (error) {
      // Se não for uma exceção customizada, será tratada como erro interno
      // O ErrorHandler capturará e retornará 500
      throw error;
    }
  }
);

// ============================================
// Funções auxiliares (mock)
// ============================================

async function buscarUsuario(id: string): Promise<any> {
  // Mock
  return null;
}

function isValidEmail(email: string): boolean {
  // Mock
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidToken(token: string): boolean {
  // Mock
  return token.length > 0;
}

async function operacaoRiscosa(): Promise<void> {
  // Mock
  throw new Error('Erro genérico');
}
