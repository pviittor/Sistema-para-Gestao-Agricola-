import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import NotaFiscal from './NotaFiscal';
import Produto from './Produto';
import Usuario from './Usuario';
import Cfop from './Cfop';

/**
 * Interface para atributos da entidade ItemNotaFiscal
 */
interface ItemNotaFiscalAttributes {
  id_item_nf: number;
  tenantId: number;
  notaFiscalId: number;
  produtoId: number;
  numero_item: number;
  codigo_produto: string;
  descricao: string;
  ncm: string;
  cest?: string | null;
  cfop: string;
  unidade: string;
  quantidade: number;
  vl_unitario: number;
  vl_desconto: number;
  vl_frete: number;
  vl_seguro: number;
  vl_outros: number;
  vl_bruto: number;
  vl_total: number;
  cst_icms: string;
  modalidade_bc_icms?: string | null;
  aliq_icms: number;
  vl_bc_icms: number;
  vl_icms: number;
  aliq_icms_st: number;
  vl_bc_icms_st: number;
  vl_icms_st: number;
  cst_ipi?: string | null;
  aliq_ipi: number;
  vl_ipi: number;
  cst_pis: string;
  aliq_pis: number;
  vl_pis: number;
  cst_cofins: string;
  aliq_cofins: number;
  vl_cofins: number;
  numero_lote?: string | null;
  data_fabricacao?: string | null;
  data_validade?: string | null;
  numero_serie_item?: string | null;
  informacoes_adicionais?: string | null;
  movimentou_estoque: boolean;
  itemPedidoCompraId?: number | null;
  cfopId?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_item_nf e opcional pois e auto-increment)
 */
interface ItemNotaFiscalCreationAttributes extends Optional<ItemNotaFiscalAttributes,
  'id_item_nf' | 'datecreation' | 'cest' | 'vl_desconto' | 'vl_frete' | 'vl_seguro' | 'vl_outros' |
  'vl_bruto' | 'vl_total' | 'modalidade_bc_icms' | 'aliq_icms' | 'vl_bc_icms' | 'vl_icms' |
  'aliq_icms_st' | 'vl_bc_icms_st' | 'vl_icms_st' | 'cst_ipi' | 'aliq_ipi' | 'vl_ipi' |
  'aliq_pis' | 'vl_pis' | 'aliq_cofins' | 'vl_cofins' | 'numero_lote' | 'data_fabricacao' |
  'data_validade' | 'numero_serie_item' | 'informacoes_adicionais' | 'movimentou_estoque' |
  'itemPedidoCompraId' | 'cfopId'
> {}

/**
 * Modelo Sequelize para a entidade ItemNotaFiscal
 *
 * Itens (produtos/servicos) vinculados a uma nota fiscal
 */
class ItemNotaFiscal
  extends Model<ItemNotaFiscalAttributes, ItemNotaFiscalCreationAttributes>
  implements ItemNotaFiscalAttributes
{
  public id_item_nf!: number;
  public tenantId!: number;
  public notaFiscalId!: number;
  public produtoId!: number;
  public numero_item!: number;
  public codigo_produto!: string;
  public descricao!: string;
  public ncm!: string;
  public cest!: string | null;
  public cfop!: string;
  public unidade!: string;
  public quantidade!: number;
  public vl_unitario!: number;
  public vl_desconto!: number;
  public vl_frete!: number;
  public vl_seguro!: number;
  public vl_outros!: number;
  public vl_bruto!: number;
  public vl_total!: number;
  public cst_icms!: string;
  public modalidade_bc_icms!: string | null;
  public aliq_icms!: number;
  public vl_bc_icms!: number;
  public vl_icms!: number;
  public aliq_icms_st!: number;
  public vl_bc_icms_st!: number;
  public vl_icms_st!: number;
  public cst_ipi!: string | null;
  public aliq_ipi!: number;
  public vl_ipi!: number;
  public cst_pis!: string;
  public aliq_pis!: number;
  public vl_pis!: number;
  public cst_cofins!: string;
  public aliq_cofins!: number;
  public vl_cofins!: number;
  public numero_lote!: string | null;
  public data_fabricacao!: string | null;
  public data_validade!: string | null;
  public numero_serie_item!: string | null;
  public informacoes_adicionais!: string | null;
  public movimentou_estoque!: boolean;
  public itemPedidoCompraId!: number | null;
  public cfopId!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public notaFiscal?: NotaFiscal;
  public produto?: Produto;
  public usuarioCriador?: Usuario;
}

ItemNotaFiscal.init(
  {
    id_item_nf: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico do item da nota fiscal',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o item pertence',
    },
    notaFiscalId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da nota fiscal',
      references: {
        model: 'C045_notaFiscal',
        key: 'id_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    numero_item: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Numero sequencial do item dentro da nota',
    },
    codigo_produto: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'Codigo do produto no momento da emissao (desnormalizado)',
    },
    descricao: {
      type: DataTypes.STRING(120),
      allowNull: false,
      comment: 'Descricao do produto no momento da emissao',
    },
    ncm: {
      type: DataTypes.STRING(8),
      allowNull: false,
      comment: 'Nomenclatura Comum do Mercosul (8 digitos)',
    },
    cest: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: 'Codigo Especificador da Substituicao Tributaria (7 digitos)',
    },
    cfop: {
      type: DataTypes.STRING(4),
      allowNull: false,
      comment: 'Codigo Fiscal de Operacoes e Prestacoes (4 digitos)',
    },
    unidade: {
      type: DataTypes.STRING(6),
      allowNull: false,
      comment: 'Unidade de medida (UN, KG, CX, LT, etc)',
    },
    quantidade: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade do item',
    },
    vl_unitario: {
      type: DataTypes.DECIMAL(15, 10),
      allowNull: false,
      comment: 'Valor unitario do item',
    },
    vl_desconto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do desconto',
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
    vl_outros: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Outros valores',
    },
    vl_bruto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor bruto (quantidade x vl_unitario)',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total (vl_bruto - vl_desconto + vl_frete + vl_seguro + vl_outros)',
    },
    cst_icms: {
      type: DataTypes.STRING(3),
      allowNull: false,
      comment: 'Codigo CST/CSOSN do ICMS (2-3 digitos)',
    },
    modalidade_bc_icms: {
      type: DataTypes.STRING(1),
      allowNull: true,
      comment: 'Modalidade base calculo ICMS: 0=MVA, 1=pauta, 2=preco tabelado, 3=valor operacao',
    },
    aliq_icms: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Aliquota ICMS (%)',
    },
    vl_bc_icms: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Base de calculo ICMS',
    },
    vl_icms: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do ICMS',
    },
    aliq_icms_st: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Aliquota ICMS ST (%)',
    },
    vl_bc_icms_st: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Base de calculo ICMS ST',
    },
    vl_icms_st: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do ICMS ST',
    },
    cst_ipi: {
      type: DataTypes.STRING(2),
      allowNull: true,
      comment: 'Codigo CST do IPI (2 digitos)',
    },
    aliq_ipi: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Aliquota IPI (%)',
    },
    vl_ipi: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do IPI',
    },
    cst_pis: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Codigo CST do PIS (2 digitos)',
    },
    aliq_pis: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Aliquota PIS (%)',
    },
    vl_pis: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do PIS',
    },
    cst_cofins: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Codigo CST do COFINS (2 digitos)',
    },
    aliq_cofins: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Aliquota COFINS (%)',
    },
    vl_cofins: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do COFINS',
    },
    numero_lote: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Numero do lote do produto',
    },
    data_fabricacao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de fabricacao do produto',
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de validade do produto',
    },
    numero_serie_item: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Numero de serie do item',
    },
    informacoes_adicionais: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Informacoes adicionais do item',
    },
    movimentou_estoque: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o item ja movimentou o estoque',
    },
    itemPedidoCompraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do item do pedido de compra vinculado',
      references: {
        model: 'C048_itemPedidoCompra',
        key: 'id_item_ped',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    cfopId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para entidade CFOP (C051_cfop)',
      references: {
        model: 'C051_cfop',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    tableName: 'C046_itemNotaFiscal',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['notaFiscalId'],
      },
      {
        fields: ['produtoId'],
      },
      {
        unique: true,
        fields: ['notaFiscalId', 'numero_item'],
        name: 'idx_itemNF_notaFiscal_numeroItem',
      },
      {
        fields: ['ncm'],
      },
      {
        fields: ['cfop'],
      },
      {
        fields: ['numero_lote'],
      },
      {
        fields: ['numero_serie_item'],
      },
      {
        fields: ['movimentou_estoque'],
      },
      {
        fields: ['itemPedidoCompraId'],
      },
      {
        fields: ['cfopId'],
      },
    ],
  }
);

// Setup associations
ItemNotaFiscal.belongsTo(NotaFiscal, { foreignKey: 'notaFiscalId', as: 'notaFiscal' });
ItemNotaFiscal.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto' });
ItemNotaFiscal.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
NotaFiscal.hasMany(ItemNotaFiscal, { foreignKey: 'notaFiscalId', as: 'itens', onDelete: 'CASCADE' });
ItemNotaFiscal.belongsTo(Cfop, { foreignKey: 'cfopId', as: 'cfopEntidade' });

export default ItemNotaFiscal;
