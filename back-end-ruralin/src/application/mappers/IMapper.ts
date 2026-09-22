/**
 * IMapper - Interface genérica para mappers
 * 
 * Esta interface define o contrato padrão para mappers que convertem
 * entre DTOs e entidades do domínio.
 * 
 * Mappers são responsáveis por:
 * - Converter DTOs de entrada para entidades (toEntity)
 * - Converter entidades para DTOs de saída (toDto)
 * - Garantir que dados sensíveis não sejam expostos
 * - Aplicar transformações necessárias
 * 
 * @template TEntity - Tipo da entidade do domínio
 * @template TDto - Tipo do DTO de resposta
 * @template TCreateDto - Tipo do DTO de criação
 * @template TUpdateDto - Tipo do DTO de atualização
 * 
 * @example
 * ```typescript
 * export class UsuarioMapper implements IMapper<Usuario, UsuarioResponseDto, CreateUsuarioDto, UpdateUsuarioDto> {
 *   toEntity(dto: CreateUsuarioDto | UpdateUsuarioDto): Partial<Usuario> {
 *     // Conversão de DTO para entidade
 *   }
 * 
 *   toDto(entity: Usuario): UsuarioResponseDto {
 *     // Conversão de entidade para DTO
 *   }
 * }
 * ```
 */

/**
 * Interface genérica para mappers
 * 
 * Define métodos padrão para conversão entre DTOs e entidades.
 * 
 * @template TEntity - Tipo da entidade do domínio
 * @template TDto - Tipo do DTO de resposta
 * @template TCreateDto - Tipo do DTO de criação
 * @template TUpdateDto - Tipo do DTO de atualização
 */
export interface IMapper<TEntity, TDto, TCreateDto, TUpdateDto> {
  /**
   * Converte DTO para entidade do domínio
   * 
   * @param dto - DTO de criação ou atualização
   * @returns Promise que resolve com dados parciais da entidade (para criação/atualização)
   * 
   * @example
   * ```typescript
   * const dto: CreateUsuarioDto = { nome: 'João', email: 'joao@example.com', senha: 'Senha123' };
   * const entity = await mapper.toEntity(dto);
   * // entity: { nome: 'João', email: 'joao@example.com', senha: 'hash...' }
   * ```
   */
  toEntity(dto: TCreateDto | TUpdateDto): Promise<Partial<TEntity>>;

  /**
   * Converte entidade do domínio para DTO
   * 
   * @param entity - Entidade do domínio
   * @returns DTO de resposta (sem dados sensíveis)
   * 
   * @example
   * ```typescript
   * const entity: Usuario = { id: 1, nome: 'João', email: 'joao@example.com', senha: 'hash' };
   * const dto = mapper.toDto(entity);
   * // dto: { id: 1, nome: 'João', email: 'joao@example.com' } (sem senha)
   * ```
   */
  toDto(entity: TEntity): TDto;
}
