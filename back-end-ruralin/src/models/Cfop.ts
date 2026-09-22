import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Enum para natureza do CFOP
 */
export enum NaturezaCfop {
  ENTRADA = 'entrada',
  SAIDA = 'saida',
}

/**
 * Enum para tipo de operação do CFOP
 */
export enum TipoOperacaoCfop {
  VENDA = 'venda',
  COMPRA = 'compra',
  TRANSFERENCIA = 'transferencia',
  REMESSA = 'remessa',
  RETORNO = 'retorno',
  DEVOLUCAO = 'devolucao',
  BONIFICACAO = 'bonificacao',
  CONSIGNACAO = 'consignacao',
  OUTRAS = 'outras',
}

/**
 * Interface para atributos da entidade Cfop
 */
interface CfopAttributes {
  id: number;
  codigo: string;
  descricao: string;
  natureza: string;
  tipo_operacao: string;
  gera_financeiro: boolean;
  movimenta_estoque: boolean;
  aplicacao_ipi: boolean;
  aplicacao_icms: boolean;
  aplicacao_pis_cofins: boolean;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface CfopCreationAttributes extends Optional<CfopAttributes,
  'id' | 'gera_financeiro' | 'movimenta_estoque' | 'aplicacao_ipi' |
  'aplicacao_icms' | 'aplicacao_pis_cofins' | 'ativo' | 'createdAt' | 'updatedAt'
> {}

/**
 * Modelo Sequelize para a entidade Cfop
 *
 * Código Fiscal de Operações e Prestações (CFOP) - entidade global (sem tenant)
 */
class Cfop
  extends Model<CfopAttributes, CfopCreationAttributes>
  implements CfopAttributes
{
  public id!: number;
  public codigo!: string;
  public descricao!: string;
  public natureza!: string;
  public tipo_operacao!: string;
  public gera_financeiro!: boolean;
  public movimenta_estoque!: boolean;
  public aplicacao_ipi!: boolean;
  public aplicacao_icms!: boolean;
  public aplicacao_pis_cofins!: boolean;
  public ativo!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Cfop.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do CFOP',
    },
    codigo: {
      type: DataTypes.STRING(4),
      allowNull: false,
      unique: true,
      comment: 'Código CFOP (4 dígitos)',
    },
    descricao: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Descrição do CFOP',
    },
    natureza: {
      type: DataTypes.ENUM('entrada', 'saida'),
      allowNull: false,
      comment: 'Natureza da operação (entrada ou saída)',
    },
    tipo_operacao: {
      type: DataTypes.ENUM('venda', 'compra', 'transferencia', 'remessa', 'retorno', 'devolucao', 'bonificacao', 'consignacao', 'outras'),
      allowNull: false,
      comment: 'Tipo de operação fiscal',
    },
    gera_financeiro: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a operação gera movimentação financeira',
    },
    movimenta_estoque: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a operação movimenta estoque',
    },
    aplicacao_ipi: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se há aplicação de IPI',
    },
    aplicacao_icms: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se há aplicação de ICMS',
    },
    aplicacao_pis_cofins: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se há aplicação de PIS/COFINS',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro está ativo',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação do registro',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de atualização do registro',
    },
  },
  {
    sequelize,
    tableName: 'C051_cfop',
    timestamps: true,
    underscored: false,
  }
);

export default Cfop;
