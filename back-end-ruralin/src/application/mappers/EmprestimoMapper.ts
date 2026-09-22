/**
 * EmprestimoMapper - Mapper para entidade Emprestimo
 *
 * Responsável por converter entre DTOs e entidades do domínio para Emprestimo.
 *
 * Regras importantes:
 * - Mapear todos os campos corretamente entre DTO e entidade
 * - Tratar campos opcionais/nulos corretamente
 *
 * @example
 * ```typescript
 * const mapper = new EmprestimoMapper();
 *
 * // Converter DTO para entidade
 * const entity = await mapper.toEntity(createDto);
 *
 * // Converter entidade para DTO
 * const dto = mapper.toDto(emprestimo);
 * ```
 */

import { Injectable } from '../../core/di';
import { IMapper } from './IMapper';
import Emprestimo from '../../models/Emprestimo';
import { CreateEmprestimoDto } from '../dto/emprestimo/CreateEmprestimoDto';
import { UpdateEmprestimoDto } from '../dto/emprestimo/UpdateEmprestimoDto';
import { EmprestimoResponseDto, EmprestimoDetailResponseDto } from '../dto/emprestimo/EmprestimoResponseDto';
import { adicionarCamposFormatados } from '../../utils/moeda';

/**
 * Mapper para entidade Emprestimo
 *
 * Implementa conversão entre DTOs e entidades, garantindo que:
 * - Todos os campos sejam mapeados corretamente
 * - Campos opcionais/nulos sejam tratados adequadamente
 * - Associações incluídas via Sequelize (fazenda, parceiro, itens, devolucoes) sejam mapeadas
 */
@Injectable()
export class EmprestimoMapper implements IMapper<Emprestimo, EmprestimoDetailResponseDto, CreateEmprestimoDto, UpdateEmprestimoDto> {
  /**
   * Converte DTO para entidade do domínio
   *
   * @param dto - DTO de criação ou atualização
   * @returns Dados parciais da entidade
   */
  async toEntity(dto: CreateEmprestimoDto | UpdateEmprestimoDto): Promise<Partial<Emprestimo>> {
    const entity: any = {};

    if ('fazendaId' in dto && dto.fazendaId !== undefined) entity.fazendaId = dto.fazendaId;
    if ('parceiroId' in dto && dto.parceiroId !== undefined) entity.parceiroId = dto.parceiroId;
    if ('data_emp' in dto && dto.data_emp !== undefined) entity.data_emp = dto.data_emp;
    if ('devolucao_emp' in dto && dto.devolucao_emp !== undefined) entity.devolucao_emp = dto.devolucao_emp;
    if ('encerramento_emp' in dto && dto.encerramento_emp !== undefined) entity.encerramento_emp = dto.encerramento_emp;
    if ('tipo_emp' in dto && dto.tipo_emp !== undefined) entity.tipo_emp = dto.tipo_emp;
    if ('situacao_emp' in dto && dto.situacao_emp !== undefined) entity.situacao_emp = dto.situacao_emp;
    if ('observacao_emp' in dto && dto.observacao_emp !== undefined) entity.observacao_emp = dto.observacao_emp;
    if ('prazo_dias' in dto && dto.prazo_dias !== undefined) entity.prazo_dias = dto.prazo_dias;
    if ('multa_percentual' in dto && dto.multa_percentual !== undefined) entity.multa_percentual = dto.multa_percentual;
    if ('juros_diario_percentual' in dto && dto.juros_diario_percentual !== undefined) entity.juros_diario_percentual = dto.juros_diario_percentual;

    return entity;
  }

  /**
   * Converte entidade do domínio para DTO de resposta completo.
   *
   * Mapeia os campos base do empréstimo e, quando presentes (via Sequelize `include`),
   * também mapeia as associações: fazenda, parceiro, itens (com produto e devoluções aninhadas).
   *
   * @param entity - Entidade do domínio (opcionalmente com includes carregados)
   * @returns DTO de resposta completo (EmprestimoDetailResponseDto)
   */
  toDto(entity: Emprestimo): EmprestimoDetailResponseDto {
    const dto: any = {
      id: entity.id,
      tenantId: entity.tenantId,
      fazendaId: entity.fazendaId,
      parceiroId: entity.parceiroId,
      data_emp: entity.data_emp,
      devolucao_emp: entity.devolucao_emp,
      encerramento_emp: entity.encerramento_emp,
      tipo_emp: entity.tipo_emp,
      situacao_emp: entity.situacao_emp,
      observacao_emp: entity.observacao_emp,
      prazo_dias: entity.prazo_dias ?? null,
      data_limite_devolucao: entity.data_limite_devolucao ?? null,
      multa_percentual: entity.multa_percentual != null ? Number(entity.multa_percentual) : null,
      juros_diario_percentual: entity.juros_diario_percentual != null ? Number(entity.juros_diario_percentual) : null,
      financeiro_gerado: entity.financeiro_gerado ?? false,
      valor_custo_medio_total: entity.valor_custo_medio_total != null ? Number(entity.valor_custo_medio_total) : null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };

    // Mapear fazenda se incluída
    if ((entity as any).fazenda) {
      dto.fazenda = {
        id: (entity as any).fazenda.id,
        descricao: (entity as any).fazenda.descricao,
      };
    }

    // Mapear parceiro se incluído
    if ((entity as any).parceiro) {
      dto.parceiro = {
        id_pessoa: (entity as any).parceiro.id_pessoa,
        nomerazao_pessoa: (entity as any).parceiro.nomerazao_pessoa,
        cpfcnpj_pessoa: (entity as any).parceiro.cpfcnpj_pessoa,
      };
    }

    // Mapear itens se incluídos (padrão master-detail)
    if ((entity as any).itens && Array.isArray((entity as any).itens)) {
      dto.itens = (entity as any).itens.map((item: any) => {
        const itemDto: any = {
          id: item.id,
          emprestimoId: item.emprestimoId,
          produtoId: item.produtoId,
          quantidade_empi: Number(item.quantidade_empi),
          unitario_empi: Number(item.unitario_empi),
          total_empi: Number(item.total_empi),
        };

        // Mapear produto do item
        if (item.produto) {
          itemDto.produto = {
            id_prod: item.produto.id_prod,
            descricao_prod: item.produto.descricao_prod,
          };
        }

        // Mapear devoluções do item (3o nível)
        if (item.devolucoes && Array.isArray(item.devolucoes)) {
          itemDto.devolucoes = item.devolucoes.map((dev: any) => {
            const devDto: any = {
              id: dev.id,
              itemDevolucaoId: dev.itemDevolucaoId,
              produtoDevolucaoId: dev.produtoDevolucaoId,
              produtoSimilarId: dev.produtoSimilarId,
              datadevolucao_empdev: dev.datadevolucao_empdev,
              quantidadedevolvida_empdev: Number(dev.quantidadedevolvida_empdev),
              devolucaoGeraFinanceiro_empdev: dev.devolucaoGeraFinanceiro_empdev,
              devolucaoProdutoSimilar_empdev: dev.devolucaoProdutoSimilar_empdev,
            };

            // Mapear produto de devolução se incluído
            if (dev.produtoDevolucao) {
              devDto.produtoDevolucao = {
                id_prod: dev.produtoDevolucao.id_prod,
                descricao_prod: dev.produtoDevolucao.descricao_prod,
              };
            }

            // Mapear produto similar se incluído
            if (dev.produtoSimilar) {
              devDto.produtoSimilar = {
                id_prod: dev.produtoSimilar.id_prod,
                descricao_prod: dev.produtoSimilar.descricao_prod,
              };
            }

            return devDto;
          });
        }

        adicionarCamposFormatados(itemDto, ['unitario_empi', 'total_empi']);

        return itemDto;
      });
    }

    return dto;
  }
}
