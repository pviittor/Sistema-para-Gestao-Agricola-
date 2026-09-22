import { BaseException } from './BaseException';

/**
 * NotFoundException - Exceção para recursos não encontrados
 * 
 * Use esta exceção quando um recurso solicitado não for encontrado.
 * Status HTTP: 404 (Not Found)
 * 
 * @example
 * ```typescript
 * const usuario = await usuarioRepository.findById(id);
 * if (!usuario) {
 *   throw new NotFoundException('Usuário', id);
 * }
 * 
 * // Sem ID
 * throw new NotFoundException('Configuração');
 * ```
 */
export class NotFoundException extends BaseException {
  /**
   * Cria uma nova NotFoundException
   * 
   * @param resource - Nome do recurso não encontrado (ex: 'Usuário', 'Produto')
   * @param id - ID do recurso (opcional)
   * @param code - Código de erro único (padrão: 'NOT_FOUND')
   */
  constructor(
    resource: string,
    id?: string | number,
    code: string = 'NOT_FOUND'
  ) {
    const message = id
      ? `${resource} com id ${id} não encontrado`
      : `${resource} não encontrado`;
    
    super(message, 404, code, { resource, id });
  }
}
