/**
 * BaseException - Classe base para todas as exceções customizadas
 * 
 * Esta classe fornece a estrutura base para todas as exceções do sistema,
 * incluindo statusCode HTTP e código de erro padronizado.
 */

export abstract class BaseException extends Error {
  /**
   * Código de status HTTP associado à exceção
   */
  public readonly statusCode: number;

  /**
   * Código de erro único para identificação
   */
  public readonly code: string;

  /**
   * Detalhes adicionais da exceção (opcional)
   */
  public readonly details?: any;

  /**
   * Cria uma nova instância de BaseException
   * 
   * @param message - Mensagem de erro descritiva
   * @param statusCode - Código de status HTTP (ex: 400, 404, 500)
   * @param code - Código de erro único (ex: 'BUSINESS_ERROR', 'NOT_FOUND')
   * @param details - Detalhes adicionais (opcional)
   */
  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: any
  ) {
    super(message);
    
    // Define o nome da classe para debugging
    this.name = this.constructor.name;
    
    // Mantém o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Garante que a instância seja reconhecida como Error
    Object.setPrototypeOf(this, BaseException.prototype);
  }

  /**
   * Converte a exceção para um objeto JSON serializável
   * 
   * @returns Objeto com informações da exceção
   */
  toJSON(): {
    name: string;
    message: string;
    statusCode: number;
    code: string;
    details?: any;
  } {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      ...(this.details && { details: this.details }),
    };
  }
}
