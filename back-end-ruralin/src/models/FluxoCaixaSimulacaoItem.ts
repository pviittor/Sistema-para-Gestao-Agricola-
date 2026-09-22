import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import FluxoCaixaSimulacao from './FluxoCaixaSimulacao';

/**
 * Interface para atributos da entidade FluxoCaixaSimulacaoItem
 */
interface FluxoCaixaSimulacaoItemAttributes {
  id: number;
  simulacaoId: number;
  tipoOverride: string | null;
  referenciaTipo: string | null;
  referenciaId: number | null;
  descricao: string;
  tipoFluxo: string;
  dataOriginal: string | null;
  dataNova: string;
  valorOriginal: number | null;
  valorNovo: number;
  contaBancariaId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface FluxoCaixaSimulacaoItemCreationAttributes extends Optional<FluxoCaixaSimulacaoItemAttributes,
  'id' | 'tipoOverride' | 'referenciaTipo' | 'referenciaId' | 'dataOriginal' | 'valorOriginal' | 'contaBancariaId' | 'createdAt' | 'updatedAt'
> {}

/**
 * Modelo Sequelize para a entidade FluxoCaixaSimulacaoItem
 *
 * Representa um item (linha) de uma simulação de fluxo de caixa.
 * Detail do master-detail com FluxoCaixaSimulacao.
 */
class FluxoCaixaSimulacaoItem
  extends Model<FluxoCaixaSimulacaoItemAttributes, FluxoCaixaSimulacaoItemCreationAttributes>
  implements FluxoCaixaSimulacaoItemAttributes
{
  public id!: number;
  public simulacaoId!: number;
  public tipoOverride!: string | null;
  public referenciaTipo!: string | null;
  public referenciaId!: number | null;
  public descricao!: string;
  public tipoFluxo!: string;
  public dataOriginal!: string | null;
  public dataNova!: string;
  public valorOriginal!: number | null;
  public valorNovo!: number;
  public contaBancariaId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos
  public simulacao?: FluxoCaixaSimulacao;
}

FluxoCaixaSimulacaoItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do item da simulação',
    },
    simulacaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da simulação à qual o item pertence',
      references: {
        model: 'C061_fluxoCaixaSimulacao',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tipoOverride: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo de override aplicado ao item (ex: alteracao, exclusao, inclusao)',
    },
    referenciaTipo: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Tipo da entidade de referência (ex: TituloPagar, TituloReceber, Recorrencia)',
    },
    referenciaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da entidade de referência original',
    },
    descricao: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Descrição do item da simulação',
    },
    tipoFluxo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Tipo do fluxo (ENTRADA ou SAIDA)',
    },
    dataOriginal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data original do lançamento (antes da simulação)',
    },
    dataNova: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do lançamento na simulação (pode ser alterada)',
    },
    valorOriginal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Valor original do lançamento (antes da simulação)',
    },
    valorNovo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor do lançamento na simulação (pode ser alterado)',
    },
    contaBancariaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da conta bancária associada ao item',
      references: {
        model: 'contas',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
      comment: 'Data da última atualização do registro',
    },
  },
  {
    sequelize,
    tableName: 'C062_fluxoCaixaSimulacaoItem',
    timestamps: true,
    indexes: [
      { fields: ['simulacaoId'] },
      { fields: ['tipoFluxo'] },
      { fields: ['dataNova'] },
      { fields: ['contaBancariaId'] },
      { fields: ['referenciaTipo', 'referenciaId'] },
    ],
  }
);

// Setup associations (ambas no arquivo do filho — anti-circular-import)
FluxoCaixaSimulacao.hasMany(FluxoCaixaSimulacaoItem, { foreignKey: 'simulacaoId', as: 'itens', onDelete: 'CASCADE' });
FluxoCaixaSimulacaoItem.belongsTo(FluxoCaixaSimulacao, { foreignKey: 'simulacaoId', as: 'simulacao', onDelete: 'CASCADE' });

export default FluxoCaixaSimulacaoItem;
