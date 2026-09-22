import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade PlanoContaGerencial
 */
interface PlanoContaGerencialAttributes {
  id: number;
  tenantId: number;
  item: string;
  descricao: string;
  tipo: 'SINTETICA' | 'ANALITICA';
  tipoFluxo: 'RECEITA' | 'DESPESA';
  classificacao?: string | null;
  contaPaiId?: number | null;
  nivel: number;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface PlanoContaGerencialCreationAttributes extends Optional<PlanoContaGerencialAttributes, 'id' | 'datecreation' | 'ativo' | 'nivel' | 'tipoFluxo'> {}

/**
 * Modelo Sequelize para a entidade PlanoContaGerencial
 * 
 * Plano de Contas Gerencial com estrutura hierárquica de 4 níveis
 * - Contas Sintéticas: podem ter filhos
 * - Contas Analíticas: não podem ter filhos, apenas podem receber lançamentos
 */
class PlanoContaGerencial
  extends Model<PlanoContaGerencialAttributes, PlanoContaGerencialCreationAttributes>
  implements PlanoContaGerencialAttributes
{
  public id!: number;
  public tenantId!: number;
  public item!: string;
  public descricao!: string;
  public tipo!: 'SINTETICA' | 'ANALITICA';
  public tipoFluxo!: 'RECEITA' | 'DESPESA';
  public classificacao!: string | null;
  public contaPaiId!: number | null;
  public nivel!: number;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public contaPai?: PlanoContaGerencial;
  public contasFilhas?: PlanoContaGerencial[];
  public usuarioCriador?: Usuario;
}

PlanoContaGerencial.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da conta',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a conta pertence',
    },
    item: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Sequência lógica de números indicando os níveis da conta (ex: 1.0.0.0, 1.1.0.0, 1.1.1.0, 1.1.2.0)',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da conta (livre digitação)',
    },
    tipo: {
      type: DataTypes.ENUM('SINTETICA', 'ANALITICA'),
      allowNull: false,
      defaultValue: 'SINTETICA',
      comment: 'Tipo da conta: Sintética ou Analítica',
    },
    tipoFluxo: {
      type: DataTypes.ENUM('RECEITA', 'DESPESA'),
      allowNull: false,
      defaultValue: 'DESPESA',
      comment: 'Tipo de fluxo financeiro: RECEITA ou DESPESA',
    },
    classificacao: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Classificação da conta (cadastro de classificação)',
    },
    contaPaiId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da conta pai (para hierarquia). NULL para contas de primeiro nível',
      references: {
        model: 'C013_planoContaGerencial',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    nivel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Nível hierárquico da conta (1 a 4)',
      validate: {
        min: 1,
        max: 4,
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se a conta está ativa',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação do registro',
    },
  },
  {
    sequelize,
    tableName: 'C013_planoContaGerencial',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['item'],
        unique: true,
      },
      {
        fields: ['contaPaiId'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['tipoFluxo'],
      },
      {
        fields: ['nivel'],
      },
    ],
  }
);

// Setup associations
PlanoContaGerencial.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
PlanoContaGerencial.belongsTo(PlanoContaGerencial, { foreignKey: 'contaPaiId', as: 'contaPai' });
PlanoContaGerencial.hasMany(PlanoContaGerencial, { foreignKey: 'contaPaiId', as: 'contasFilhas' });

export default PlanoContaGerencial;
