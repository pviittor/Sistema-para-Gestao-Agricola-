import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
// TODO: Importar ListaBanco quando disponível
// import ListaBanco from './ListaBanco';

/**
 * Enum para tipo de conta
 */
export enum TipoConta {
  BANCO = 'BANCO',
  CAIXA = 'CAIXA',
}

/**
 * Interface para atributos da entidade Conta
 */
interface ContaAttributes {
  id: number;
  tenantId: number;
  bancoId: number;
  nome: string;
  agencia?: string | null;
  conta?: string | null;
  tipo: TipoConta;
  saldoInicial: number;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface ContaCreationAttributes extends Optional<ContaAttributes, 'id' | 'datecreation' | 'agencia' | 'conta' | 'saldoInicial' | 'ativo'> {}

/**
 * Modelo Sequelize para a entidade Conta
 * 
 * Contas bancárias e caixas
 */
class Conta
  extends Model<ContaAttributes, ContaCreationAttributes>
  implements ContaAttributes
{
  public id!: number;
  public tenantId!: number;
  public bancoId!: number;
  public nome!: string;
  public agencia!: string | null;
  public conta!: string | null;
  public tipo!: TipoConta;
  public saldoInicial!: number;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public banco?: any; // TODO: Tipar como ListaBanco quando disponível
  public usuarioCriador?: Usuario;
}

Conta.init(
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
      comment: 'ID do tenant ao qual a conta pertence',
    },
    bancoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do banco',
      references: {
        model: 'lista_bancos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome da conta',
    },
    agencia: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Agência da conta',
    },
    conta: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número da conta',
    },
    tipo: {
      type: DataTypes.ENUM('BANCO', 'CAIXA'),
      allowNull: false,
      comment: 'Tipo de conta (BANCO, CAIXA)',
    },
    saldoInicial: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Saldo inicial da conta',
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
    tableName: 'contas',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['bancoId'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
// TODO: Configurar relacionamento com ListaBanco quando disponível
// Conta.belongsTo(ListaBanco, { foreignKey: 'bancoId', as: 'banco' });
Conta.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Conta;
