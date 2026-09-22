/**
 * Exemplos de uso do Middleware de Validação
 * 
 * Este arquivo contém exemplos práticos de como usar o sistema
 * de validação automática com DTOs.
 * 
 * NOTA: Este arquivo é apenas para documentação/exemplos, não deve ser
 * importado em produção.
 */

import { Router, Request, Response } from 'express';
import { validateDto, validateQuery, validateParams } from './validation';
import { CreateDto, UpdateDto } from '../application/dto';
import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, IsInt, IsPositive } from 'class-validator';

// ============================================
// EXEMPLO 1: DTO de Criação Simples
// ============================================

export class CreateUsuarioDto extends CreateDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome!: string;

  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email!: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  senha!: string;
}

// ============================================
// EXEMPLO 2: DTO de Atualização
// ============================================

export class UpdateUsuarioDto extends UpdateDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsOptional()
  nome?: string;

  @IsEmail({}, { message: 'Email deve ser um email válido' })
  @IsOptional()
  email?: string;
}

// ============================================
// EXEMPLO 3: DTO de Query Parameters
// ============================================

export class ListUsuarioQueryDto {
  @IsInt({ message: 'Página deve ser um número inteiro' })
  @IsPositive({ message: 'Página deve ser um número positivo' })
  @IsOptional()
  page?: number;

  @IsInt({ message: 'Limite deve ser um número inteiro' })
  @IsPositive({ message: 'Limite deve ser um número positivo' })
  @IsOptional()
  limit?: number;

  @IsString({ message: 'Busca deve ser uma string' })
  @IsOptional()
  search?: string;
}

// ============================================
// EXEMPLO 4: DTO de Route Parameters
// ============================================

export class IdParamDto {
  @IsInt({ message: 'ID deve ser um número inteiro' })
  @IsPositive({ message: 'ID deve ser um número positivo' })
  id!: number;
}

// ============================================
// EXEMPLO 5: Uso em Rotas - Body Validation
// ============================================

const router = Router();

router.post('/usuarios', validateDto(CreateUsuarioDto), async (req: Request, res: Response) => {
  // req.body agora é uma instância validada de CreateUsuarioDto
  const dto = req.body as CreateUsuarioDto;
  
  // Todos os campos foram validados e convertidos para os tipos corretos
  console.log('Nome:', dto.nome);
  console.log('Email:', dto.email);
  console.log('Senha:', dto.senha);
  
  // Criar usuário...
  res.status(201).json({ success: true, data: dto });
});

// ============================================
// EXEMPLO 6: Uso em Rotas - Query Validation
// ============================================

router.get('/usuarios', validateQuery(ListUsuarioQueryDto), async (req: Request, res: Response) => {
  // req.query agora é uma instância validada de ListUsuarioQueryDto
  const query = req.query as ListUsuarioQueryDto;
  
  const page = query.page || 1;
  const limit = query.limit || 10;
  const search = query.search;
  
  // Buscar usuários...
  res.json({ page, limit, search });
});

// ============================================
// EXEMPLO 7: Uso em Rotas - Params Validation
// ============================================

router.get('/usuarios/:id', validateParams(IdParamDto), async (req: Request, res: Response) => {
  // req.params agora é uma instância validada de IdParamDto
  const params = req.params as IdParamDto;
  
  // ID foi validado e convertido para número
  const id = params.id; // number
  
  // Buscar usuário por ID...
  res.json({ id });
});

// ============================================
// EXEMPLO 8: Uso em Rotas - Update com DTO
// ============================================

router.put('/usuarios/:id', 
  validateParams(IdParamDto),
  validateDto(UpdateUsuarioDto),
  async (req: Request, res: Response) => {
    const params = req.params as IdParamDto;
    const dto = req.body as UpdateUsuarioDto;
    
    // Atualizar usuário...
    res.json({ id: params.id, updated: dto });
  }
);

// ============================================
// EXEMPLO 9: Opções de Validação
// ============================================

// Permitir propriedades extras no body
router.post('/usuarios/flexivel', 
  validateDto(CreateUsuarioDto, {
    whitelist: false, // Não remover propriedades extras
    forbidNonWhitelisted: false, // Não lançar erro para propriedades extras
  }),
  async (req: Request, res: Response) => {
    // req.body pode conter propriedades extras além das definidas no DTO
    res.json({ success: true });
  }
);

// Desabilitar conversão automática de tipos
router.post('/usuarios/strict', 
  validateDto(CreateUsuarioDto, {
    transform: false, // Não converter tipos automaticamente
  }),
  async (req: Request, res: Response) => {
    // Tipos devem corresponder exatamente ao DTO
    res.json({ success: true });
  }
);

export default router;
