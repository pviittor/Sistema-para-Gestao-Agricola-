import { Injectable, Inject } from '../../../core/di'
import { TYPES } from '../../../core/di/types'
import { IIntegracaoEstoqueService } from './IIntegracaoEstoqueService'
import { INotaFiscalRepository } from '../../../infrastructure/repository/INotaFiscalRepository'
import { IItemNotaFiscalRepository } from '../../../infrastructure/repository/IItemNotaFiscalRepository'
import { IMovimentoEstoqueRepository } from '../../../infrastructure/repository/IMovimentoEstoqueRepository'
import { ICfopRepository } from '../../../infrastructure/repository/ICfopRepository'
import { TipoNotaFiscal, StatusNotaFiscal } from '../../../models/enums/NotaFiscalEnums'
import { TipoMovimento, OperacaoEstoque } from '../../../models/enums/MovimentoEstoqueEnums'
import { BusinessException } from '../../../core/exceptions/BusinessException'
import { NotFoundException } from '../../../core/exceptions/NotFoundException'
import { Transactional } from '../../../core/unitofwork/Transactional'
import { getRequestContext } from '../../../core/authorization/helpers'

/**
 * Serviço de integração de estoque
 *
 * Gera movimentos de estoque a partir de documentos fiscais.
 * NF entrada → movimentos de entrada (estoque físico positivo).
 * NF saída → movimentos de saída (estoque físico negativo).
 */
@Injectable()
export class IntegracaoEstoqueService implements IIntegracaoEstoqueService {

  constructor(
    @Inject(TYPES.INotaFiscalRepository)
    private notaFiscalRepository: INotaFiscalRepository,
    @Inject(TYPES.IItemNotaFiscalRepository)
    private itemNotaFiscalRepository: IItemNotaFiscalRepository,
    @Inject(TYPES.IMovimentoEstoqueRepository)
    private movimentoEstoqueRepository: IMovimentoEstoqueRepository,
    @Inject(TYPES.ICfopRepository)
    private cfopRepository: ICfopRepository
  ) {}

  /**
   * Gera movimentos de estoque a partir de uma nota fiscal autorizada
   *
   * Para cada item da NF, cria um movimento de estoque:
   * - NF entrada: quantidade positiva (entrada no estoque)
   * - NF saída: quantidade negativa (saída do estoque)
   */
  @Transactional()
  async gerarMovimentosDeNotaFiscal(notaFiscalId: number, tenantId: number): Promise<void> {
    const nf = await this.notaFiscalRepository.findById(notaFiscalId)
    if (!nf) {
      throw new NotFoundException('Nota fiscal', String(notaFiscalId))
    }

    // Validar status
    if (nf.status !== StatusNotaFiscal.AUTORIZADA) {
      throw new BusinessException(
        'Somente notas fiscais autorizadas podem movimentar estoque',
        'NF_STATUS_NAO_AUTORIZADA'
      )
    }

    // Validar que ainda não movimentou
    if (nf.estoque_movimentado) {
      throw new BusinessException(
        'O estoque desta nota fiscal já foi movimentado',
        'NF_ESTOQUE_JA_MOVIMENTADO'
      )
    }

    // Verificar se CFOP movimenta estoque
    if (nf.cfopId) {
      const cfop = await this.cfopRepository.findById(nf.cfopId)
      if (cfop && !(cfop as any).movimenta_estoque) {
        // CFOP não movimenta estoque — marcar flag e retornar
        await this.notaFiscalRepository.update(notaFiscalId, {
          estoque_movimentado: true,
        } as any)
        return
      }
    }

    // Buscar itens da NF
    const itens = await this.itemNotaFiscalRepository.findByNotaFiscal(notaFiscalId)
    if (itens.length === 0) {
      throw new BusinessException(
        'Nota fiscal sem itens para movimentar estoque',
        'NF_SEM_ITENS'
      )
    }

    const context = getRequestContext()
    const userId = context?.getUserId() || 1

    // Determinar direção do movimento
    const isEntrada = nf.tipo === TipoNotaFiscal.ENTRADA
    const dataMovimento = nf.data_emissao
      ? new Date(nf.data_emissao).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

    for (const item of itens) {
      const quantidade = Number(item.quantidade) || 0
      if (quantidade <= 0) continue

      const valorUnitario = Number(item.vl_unitario) || 0
      const valorTotal = Number((quantidade * valorUnitario).toFixed(4))

      // Para saída, quantidade é negativa no movimento
      const quantidadeMovimento = isEntrada ? quantidade : -quantidade

      await this.movimentoEstoqueRepository.create({
        tenantId,
        idProduto: item.produtoId,
        idProdutor: nf.destinatarioId || null,
        idFazenda: (nf as any).fazendaId || 1,
        idItemNotaFiscal: item.id_item_nf,
        tipomov: TipoMovimento.ESTOQUE_FISICO,
        operacao: OperacaoEstoque.ESTOQUE_FISICO,
        quantidade: quantidadeMovimento,
        data: dataMovimento,
        valor: valorTotal,
        usercreation: userId,
      } as any)
    }

    // Marcar NF como estoque movimentado
    await this.notaFiscalRepository.update(notaFiscalId, {
      estoque_movimentado: true,
    } as any)
  }

  /**
   * Reverte movimentos de estoque de uma nota fiscal (cancelamento)
   *
   * Remove todos os movimentos de estoque vinculados aos itens da NF.
   */
  @Transactional()
  async reverterMovimentosDeNotaFiscal(notaFiscalId: number, tenantId: number): Promise<void> {
    const itens = await this.itemNotaFiscalRepository.findByNotaFiscal(notaFiscalId)

    for (const item of itens) {
      // Buscar movimentos vinculados a este item
      const movimentos = await this.movimentoEstoqueRepository.findAll({
        where: {
          idItemNotaFiscal: item.id_item_nf,
          tenantId,
        },
      } as any)

      // Deletar cada movimento
      for (const mov of (movimentos as any) || []) {
        await this.movimentoEstoqueRepository.delete(mov.id_mov)
      }
    }

    // Desmarcar flag
    await this.notaFiscalRepository.update(notaFiscalId, {
      estoque_movimentado: false,
    } as any)
  }
}
