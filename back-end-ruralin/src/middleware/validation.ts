/**
 * Validation Middleware
 * 
 * Middleware para validação automática de DTOs usando class-validator.
 * Converte o body da requisição em uma instância do DTO e valida
 * usando decorators do class-validator.
 * 
 * Se a validação falhar, lança uma ValidationException com os erros
 * formatados, que será capturada pelo ErrorHandler.
 */

import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ValidationException } from '../core/exceptions/ValidationException';

/**
 * Formata erros de validação do class-validator em formato legível
 * 
 * @param errors - Array de erros de validação do class-validator
 * @returns Array de erros formatados
 */
function formatValidationErrors(errors: ValidationError[]): Array<{
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}> {
  const formattedErrors: Array<{
    field: string;
    message: string;
    value?: any;
    constraints?: Record<string, string>;
  }> = [];

  function extractErrors(errors: ValidationError[], parentPath: string = ''): void {
    for (const error of errors) {
      const fieldPath = parentPath ? `${parentPath}.${error.property}` : error.property;

      if (error.constraints) {
        // Pegar a primeira mensagem de constraint como mensagem principal
        const firstConstraint = Object.values(error.constraints)[0];
        formattedErrors.push({
          field: fieldPath,
          message: firstConstraint,
          value: error.value,
          constraints: error.constraints,
        });
      }

      // Processar erros aninhados (para objetos e arrays)
      if (error.children && error.children.length > 0) {
        extractErrors(error.children, fieldPath);
      }
    }
  }

  extractErrors(errors);
  return formattedErrors;
}

/**
 * Middleware factory para validação de DTOs
 * 
 * Cria um middleware que valida o body da requisição contra um DTO.
 * Se a validação passar, substitui req.body pela instância validada do DTO.
 * Se falhar, lança uma ValidationException.
 * 
 * @param dtoClass - Classe do DTO a ser validado
 * @param options - Opções de validação
 * @returns Middleware de validação
 * 
 * @example
 * ```typescript
 * import { validateDto } from '../middleware/validation';
 * import { CreateUsuarioDto } from '../application/dto/usuario/CreateUsuarioDto';
 * 
 * router.post('/usuarios', validateDto(CreateUsuarioDto), (req, res) => {
 *   // req.body agora é uma instância validada de CreateUsuarioDto
 *   const dto = req.body as CreateUsuarioDto;
 *   // ...
 * });
 * ```
 */
export function validateDto(
  dtoClass: new () => any,
  options?: {
    /**
     * Se true, permite que propriedades não definidas no DTO sejam mantidas
     * Padrão: false (remove propriedades não definidas)
     */
    whitelist?: boolean;
    
    /**
     * Se true, remove propriedades não definidas no DTO
     * Padrão: true
     */
    forbidNonWhitelisted?: boolean;
    
    /**
     * Se true, tenta converter tipos automaticamente
     * Padrão: true
     */
    transform?: boolean;
    
    /**
     * Se true, valida objetos aninhados
     * Padrão: true
     */
    validateNested?: boolean;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Converter o body da requisição em uma instância do DTO
      // excludeExtraneousValues só deve ser true se explicitamente solicitado
      // pois requer @Expose() em todas as propriedades do DTO
      const dto = plainToInstance(dtoClass, req.body, {
        enableImplicitConversion: options?.transform !== false,
        excludeExtraneousValues: options?.forbidNonWhitelisted === true,
      });

      // Validar o DTO
      // whitelist e forbidNonWhitelisted devem ser false por padrão
      // para permitir que propriedades extras sejam ignoradas sem erro
      const errors = await validate(dto, {
        whitelist: options?.whitelist === true,
        forbidNonWhitelisted: options?.forbidNonWhitelisted === true,
        validateCustomDecorators: true,
        validationError: {
          target: false, // Não incluir o objeto target no erro
          value: true, // Incluir o valor que falhou na validação
        },
      });

      // Se houver erros de validação, lançar exceção
      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        const errorMessages = formattedErrors.map(e => e.message).join(', ');
        
        throw new ValidationException(
          `Dados de entrada inválidos: ${errorMessages}`,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }

      // Substituir req.body pela instância validada do DTO
      req.body = dto;

      next();
    } catch (error) {
      // Se já for uma ValidationException, apenas passar adiante
      if (error instanceof ValidationException) {
        return next(error);
      }

      // Para outros erros, lançar como erro interno
      return next(error);
    }
  };
}

/**
 * Middleware para validação de query parameters
 * 
 * Similar ao validateDto, mas valida req.query ao invés de req.body.
 * 
 * @param dtoClass - Classe do DTO a ser validado
 * @param options - Opções de validação
 * @returns Middleware de validação
 * 
 * @example
 * ```typescript
 * import { validateQuery } from '../middleware/validation';
 * import { ListUsuarioQueryDto } from '../application/dto/usuario/ListUsuarioQueryDto';
 * 
 * router.get('/usuarios', validateQuery(ListUsuarioQueryDto), (req, res) => {
 *   const query = req.query as ListUsuarioQueryDto;
 *   // ...
 * });
 * ```
 */
export function validateQuery(
  dtoClass: new () => any,
  options?: {
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Converter query parameters em uma instância do DTO
      const dto = plainToInstance(dtoClass, req.query, {
        enableImplicitConversion: options?.transform !== false,
        excludeExtraneousValues: options?.forbidNonWhitelisted === true,
      });

      // Validar o DTO
      const errors = await validate(dto, {
        whitelist: options?.whitelist === true,
        forbidNonWhitelisted: options?.forbidNonWhitelisted === true,
        validateCustomDecorators: true,
        validationError: {
          target: false,
          value: true,
        },
      });

      // Se houver erros de validação, lançar exceção
      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        const errorMessages = formattedErrors.map(e => e.message).join(', ');
        
        throw new ValidationException(
          `Parâmetros de query inválidos: ${errorMessages}`,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }

      // Substituir req.query pela instância validada do DTO
      req.query = dto as any;

      next();
    } catch (error) {
      if (error instanceof ValidationException) {
        return next(error);
      }
      return next(error);
    }
  };
}

/**
 * Middleware para validação de route parameters
 * 
 * Valida req.params usando um DTO.
 * 
 * @param dtoClass - Classe do DTO a ser validado
 * @param options - Opções de validação
 * @returns Middleware de validação
 * 
 * @example
 * ```typescript
 * import { validateParams } from '../middleware/validation';
 * import { IdParamDto } from '../application/dto/common/IdParamDto';
 * 
 * router.get('/usuarios/:id', validateParams(IdParamDto), (req, res) => {
 *   const params = req.params as IdParamDto;
 *   // ...
 * });
 * ```
 */
export function validateParams(
  dtoClass: new () => any,
  options?: {
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Converter route parameters em uma instância do DTO
      const dto = plainToInstance(dtoClass, req.params, {
        enableImplicitConversion: options?.transform !== false,
        excludeExtraneousValues: options?.forbidNonWhitelisted === true,
      });

      // Validar o DTO
      const errors = await validate(dto, {
        whitelist: options?.whitelist === true,
        forbidNonWhitelisted: options?.forbidNonWhitelisted === true,
        validateCustomDecorators: true,
        validationError: {
          target: false,
          value: true,
        },
      });

      // Se houver erros de validação, lançar exceção
      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        const errorMessages = formattedErrors.map(e => e.message).join(', ');
        
        throw new ValidationException(
          `Parâmetros de rota inválidos: ${errorMessages}`,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }

      // Substituir req.params pela instância validada do DTO
      req.params = dto as any;

      next();
    } catch (error) {
      if (error instanceof ValidationException) {
        return next(error);
      }
      return next(error);
    }
  };
}

/**
 * Middleware para validação de DTO em updates
 * 
 * Similar ao validateDto, mas passa o ID do request params para o DTO,
 * permitindo que validadores customizados (como IsUnique) excluam o registro atual.
 * 
 * @param dtoClass - Classe do DTO a ser validado
 * @param idParamName - Nome do parâmetro de ID na rota (padrão: 'id')
 * @param options - Opções de validação
 * @returns Middleware de validação
 * 
 * @example
 * ```typescript
 * router.put('/usuarios/:id', validateDtoUpdate(UpdateUsuarioDto), handler);
 * ```
 */
export function validateDtoUpdate(
  dtoClass: new () => any,
  idParamName: string = 'id',
  options?: {
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Obter ID do request params
      const id = req.params[idParamName];
      
      // Converter o body da requisição em uma instância do DTO
      const bodyWithId = { ...req.body, _updateId: id, id: id };
      const dto = plainToInstance(dtoClass, bodyWithId, {
        enableImplicitConversion: options?.transform !== false,
        excludeExtraneousValues: options?.forbidNonWhitelisted === true,
      });

      // Validar o DTO
      const errors = await validate(dto, {
        whitelist: options?.whitelist === true,
        forbidNonWhitelisted: options?.forbidNonWhitelisted === true,
        validateCustomDecorators: true,
        validationError: {
          target: false,
          value: true,
        },
      });

      // Se houver erros de validação, lançar exceção
      if (errors.length > 0) {
        const formattedErrors = formatValidationErrors(errors);
        const errorMessages = formattedErrors.map(e => e.message).join(', ');
        
        throw new ValidationException(
          `Dados de entrada inválidos: ${errorMessages}`,
          'VALIDATION_ERROR',
          formattedErrors
        );
      }

      // Remover campos auxiliares antes de passar para o controller
      delete (dto as any)._updateId;
      delete (dto as any).id;

      // Substituir req.body pela instância validada do DTO
      req.body = dto;

      next();
    } catch (error) {
      if (error instanceof ValidationException) {
        return next(error);
      }
      return next(error);
    }
  };
}
