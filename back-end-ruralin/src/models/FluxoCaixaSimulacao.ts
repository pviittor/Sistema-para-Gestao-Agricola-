import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Enum para status da simulação
 */
export enum StatusSimulacao {
  RASCUNHO = 'rascunho',
  SALVO = 'salvo',
  ARQUIVADO = 'arquivado',
}

/**
 * Interface para atributos da entidade FluxoCaixaSimulacao
 */
interface FluxoCaixaSimulacaoAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  nome: string;
  descricao: string | null;
  dataInicio: string;
  dataFim: string;
  status: string;
  resultadoSnapshot: object | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface FluxoCaixaSimulacaoCreationAttributes extends Optional<FluxoCaixaSimulacaoAttributes,
  'id' | 'descricao' | 'status' | 'resultadoSnapshot' | 'createdAt' | 'updatedAt'
> {}

/**
 * Modelo Sequelize para a entidade FluxoCaixaSimulacao
 *
 * Representa uma simulação de fluxo de caixa criada por um usuário.
 * Master do master-detail com FluxoCaixaSimulacaoItem.
 */
class FluxoCaixaSimulacao
  extends Model<FluxoCaixaSimulacaoAttributes, FluxoCaixaSimulacaoCreationAttributes>
  implements FluxoCaixaSimulacaoAttributes
{
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public nome!: string;
  public descricao!: string | null;
  public dataInicio!: string;
  public dataFim!: string;
  public status!: string;
  public resultadoSnapshot!: object | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos
  public usuario?: Usuario;
}

FluxoCaixaSimulacao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da simulação de fluxo de caixa',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a simulação pertence',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou a simulação',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome da simulação',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada da simulação',
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de início do período da simulação',
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de fim do período da simulação',
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'salvo', 'arquivado'),
      allowNull: false,
      defaultValue: 'rascunho',
      comment: 'Status da simulação (rascunho, salvo, arquivado)',
    },
    resultadoSnapshot: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: 'Snapshot dos resultados calculados da simulação (JSON)',
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
    tableName: 'C061_fluxoCaixaSimulacao',
    timestamps: true,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['usuarioId'] },
      { fields: ['status'] },
      { fields: ['dataInicio'] },
      { fields: ['dataFim'] },
    ],
  }
);

// Setup associations
FluxoCaixaSimulacao.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// hasMany para FluxoCaixaSimulacaoItem é definido no arquivo do filho (master-detail pattern)

export default FluxoCaixaSimulacao;
