import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Pessoa from './Pessoa';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade PedidoCompra
 */
interface PedidoCompraAttributes {
  id_ped_compra: number;
  tenantId: number;
  numero: string;
  empresaId: number;
  fornecedorId: number;
  compradorId?: number | null;
  status: string;
  data_emissao: Date;
  data_previsao_entrega?: Date | null;
  data_aprovacao?: Date | null;
  aprovadoPorId?: number | null;
  condicaoPagamentoId?: number | null;
  forma_pagamento?: string | null;
  prazo_pagamento_dias?: number | null;
  localEntregaId?: number | null;
  cfop?: string | null;
  vl_produtos: number;
  vl_frete: number;
  vl_seguro: number;
  vl_desconto: number;
  vl_outros: number;
  vl_total: number;
  percentual_tolerancia: number;
  permite_entrega_parcial: boolean;
  observacoes?: string | null;
  observacoes_fornecedor?: string | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: Date | null;
  ativo: boolean;
  condicao_pagamento?: string | null;
  parcelas_qtd?: number | null;
  cotacao_vencedora_id?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_ped_compra e opcional pois e auto-increment)
 */
interface PedidoCompraCreationAttributes extends Optional<PedidoCompraAttributes,
  'id_ped_compra' | 'datecreation' | 'compradorId' | 'status' |
  'data_previsao_entrega' | 'data_aprovacao' | 'aprovadoPorId' |
  'condicaoPagamentoId' | 'forma_pagamento' | 'prazo_pagamento_dias' |
  'localEntregaId' | 'cfop' | 'vl_produtos' | 'vl_frete' | 'vl_seguro' |
  'vl_desconto' | 'vl_outros' | 'vl_total' | 'percentual_tolerancia' |
  'permite_entrega_parcial' | 'observacoes' | 'observacoes_fornecedor' |
  'motivo_cancelamento' | 'data_cancelamento' | 'ativo' |
  'condicao_pagamento' | 'parcelas_qtd' | 'cotacao_vencedora_id'
> {}

/**
 * Modelo Sequelize para a entidade PedidoCompra
 *
 * Cabecalho de pedidos de compra de mercadorias/insumos
 */
class PedidoCompra
  extends Model<PedidoCompraAttributes, PedidoCompraCreationAttributes>
  implements PedidoCompraAttributes
{
  public id_ped_compra!: number;
  public tenantId!: number;
  public numero!: string;
  public empresaId!: number;
  public fornecedorId!: number;
  public compradorId!: number | null;
  public status!: string;
  public data_emissao!: Date;
  public data_previsao_entrega!: Date | null;
  public data_aprovacao!: Date | null;
  public aprovadoPorId!: number | null;
  public condicaoPagamentoId!: number | null;
  public forma_pagamento!: string | null;
  public prazo_pagamento_dias!: number | null;
  public localEntregaId!: number | null;
  public cfop!: string | null;
  public vl_produtos!: number;
  public vl_frete!: number;
  public vl_seguro!: number;
  public vl_desconto!: number;
  public vl_outros!: number;
  public vl_total!: number;
  public percentual_tolerancia!: number;
  public permite_entrega_parcial!: boolean;
  public observacoes!: string | null;
  public observacoes_fornecedor!: string | null;
  public motivo_cancelamento!: string | null;
  public data_cancelamento!: Date | null;
  public ativo!: boolean;
  public condicao_pagamento!: string | null;
  public parcelas_qtd!: number | null;
  public cotacao_vencedora_id!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public empresa?: Pessoa;
  public fornecedor?: Pessoa;
  public comprador?: Usuario;
  public aprovador?: Usuario;
  public usuarioCriador?: Usuario;
}

PedidoCompra.init(
  {
    id_ped_compra: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do pedido de compra',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o pedido pertence',
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Numero do pedido de compra',
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da empresa compradora',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    fornecedorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do fornecedor',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    compradorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuario comprador responsavel',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    status: {
      type: DataTypes.ENUM(
        'rascunho',
        'aguardando_aprovacao',
        'aprovado',
        'parcialmente_atendido',
        'atendido',
        'cancelado'
      ),
      allowNull: false,
      defaultValue: 'rascunho',
      comment: 'Status do pedido de compra',
    },
    data_emissao: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de emissao do pedido',
    },
    data_previsao_entrega: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data prevista para entrega',
    },
    data_aprovacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de aprovacao do pedido',
    },
    aprovadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do usuario que aprovou o pedido',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    condicaoPagamentoId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da condicao de pagamento',
      // TODO: Adicionar FK quando CondicaoPagamento for implementado
    },
    forma_pagamento: {
      type: DataTypes.STRING(30),
      allowNull: true,
      comment: 'Forma de pagamento (boleto, transferencia, cheque, cartao, dinheiro, pix)',
    },
    prazo_pagamento_dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Prazo de pagamento em dias',
    },
    localEntregaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do local de entrega',
      // TODO: Adicionar FK quando Deposito for implementado
    },
    cfop: {
      type: DataTypes.STRING(4),
      allowNull: true,
      comment: 'Codigo Fiscal de Operacoes e Prestacoes',
    },
    vl_produtos: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total dos produtos (soma dos itens)',
    },
    vl_frete: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do frete',
    },
    vl_seguro: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do seguro',
    },
    vl_desconto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do desconto',
    },
    vl_outros: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Outras despesas acessorias',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total do pedido (calculado automaticamente)',
    },
    percentual_tolerancia: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Percentual de tolerancia na entrega',
    },
    permite_entrega_parcial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se permite entrega parcial dos itens',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacoes internas do pedido',
    },
    observacoes_fornecedor: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observacoes para o fornecedor',
    },
    motivo_cancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo do cancelamento do pedido',
    },
    data_cancelamento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data do cancelamento',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro esta ativo',
    },
    condicao_pagamento: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Condição de pagamento (à vista, 30, 30/60, 30/60/90, etc.)',
    },
    parcelas_qtd: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantidade de parcelas para geração financeira',
    },
    cotacao_vencedora_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para cotação vencedora (C053 — será criada no Sprint 8, sem constraint)',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuario que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criacao do registro',
    },
  },
  {
    sequelize,
    tableName: 'C047_pedidoCompra',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['empresaId'],
      },
      {
        fields: ['fornecedorId'],
      },
      {
        fields: ['compradorId'],
      },
      {
        fields: ['aprovadoPorId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['data_emissao'],
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['usercreation'],
      },
      {
        unique: true,
        fields: ['numero', 'empresaId', 'tenantId'],
        name: 'idx_pedCompra_numero_empresa_tenant',
      },
    ],
  }
);

// Setup associations
PedidoCompra.belongsTo(Pessoa, { foreignKey: 'empresaId', as: 'empresa' });
PedidoCompra.belongsTo(Pessoa, { foreignKey: 'fornecedorId', as: 'fornecedor' });
PedidoCompra.belongsTo(Usuario, { foreignKey: 'compradorId', as: 'comprador' });
PedidoCompra.belongsTo(Usuario, { foreignKey: 'aprovadoPorId', as: 'aprovador' });
PedidoCompra.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default PedidoCompra;
