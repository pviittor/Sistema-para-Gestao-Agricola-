import { CreateCotacaoDto } from '../../dto/cotacao/CreateCotacaoDto'
import { CreateCotacaoCompletoDto } from '../../dto/cotacao/CreateCotacaoCompletoDto'
import { UpdateCotacaoDto } from '../../dto/cotacao/UpdateCotacaoDto'
import { UpdateCotacaoCompletoDto } from '../../dto/cotacao/UpdateCotacaoCompletoDto'
import { CotacaoResponseDto } from '../../dto/cotacao/CotacaoResponseDto'

/**
 * Interface para Application Service de Cotacao
 */
export interface ICotacaoApplicationService {
  /**
   * Lista cotacoes com paginacao
   */
  list(page: number, limit: number): Promise<{ data: CotacaoResponseDto[]; total: number; page: number; limit: number; totalPages: number }>

  /**
   * Busca cotacao por ID
   */
  getById(id: number): Promise<CotacaoResponseDto | null>

  /**
   * Busca cotacao por ID com itens, fornecedor e produto
   */
  getByIdDetalhado(id: number): Promise<CotacaoResponseDto | null>

  /**
   * Cria cotacao simples (sem itens)
   */
  create(dto: CreateCotacaoDto): Promise<CotacaoResponseDto>

  /**
   * Cria cotacao com itens atomicamente
   */
  createCompleto(dto: CreateCotacaoCompletoDto): Promise<CotacaoResponseDto>

  /**
   * Atualiza cotacao simples
   */
  update(id: number, dto: UpdateCotacaoDto): Promise<CotacaoResponseDto>

  /**
   * Atualiza cotacao com itens (delete-and-recreate)
   */
  updateCompleto(id: number, dto: UpdateCotacaoCompletoDto): Promise<CotacaoResponseDto>

  /**
   * Remove cotacao
   */
  delete(id: number): Promise<boolean>

  /**
   * Busca cotacoes por pedido de compra
   */
  findByPedidoCompra(pedidoCompraId: number): Promise<CotacaoResponseDto[]>

  /**
   * Calcula e persiste ranking de cotacoes de um pedido de compra
   */
  calcularRanking(pedidoCompraId: number): Promise<CotacaoResponseDto[]>

  /**
   * Seleciona cotacao vencedora e atualiza PedidoCompra
   */
  selecionarVencedora(cotacaoId: number): Promise<CotacaoResponseDto>
}
