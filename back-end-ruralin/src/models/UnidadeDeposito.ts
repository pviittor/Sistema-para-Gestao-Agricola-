import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import UnidadeMedida from './UnidadeMedida';
import Produto from './Produto';
import { TipoUnidadeDeposito } from './enums/UnidadeDepositoEnums';

/**
 * Interface para atributos da entidade UnidadeDeposito
 */
interface UnidadeDepositoAttributes {
  id: number;
  tenantId: number;
  descricao: string;
  tipo: TipoUnidadeDeposito;
  capacidade_total: number;
  idUnidadeMedida: number;
  idProduto: number;
  saldo_inicial: number;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface UnidadeDepositoCreationAttributes extends Optional<UnidadeDepositoAttributes, 'id' | 'datecreation' | 'saldo_inicial' | 'ativo'> {}

/**
 * Modelo Sequelize para a entidade UnidadeDeposito
 *
 * Unidades de depósito para armazenagem de produtos
 */
class UnidadeDeposito
  extends Model<UnidadeDepositoAttributes, UnidadeDepositoCreationAttributes>
  implements UnidadeDepositoAttributes
{
  public id!: number;
  public tenantId!: number;
  public descricao!: string;
  public tipo!: TipoUnidadeDeposito;
  public capacidade_total!: number;
  public idUnidadeMedida!: number;
  public idProduto!: number;
  public saldo_inicial!: number;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;
}

UnidadeDeposito.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da unidade de depósito',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a unidade de depósito pertence',
    },
    descricao: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Descrição da unidade de depósito',
    },
    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoUnidadeDeposito)),
      allowNull: false,
      comment: 'Tipo da unidade de depósito (Silo, Bag, Armazem, Outros)',
    },
    capacidade_total: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Capacidade total da unidade de depósito',
    },
    idUnidadeMedida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de medida',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto armazenado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    saldo_inicial: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Saldo inicial da unidade de depósito',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a unidade de depósito está ativa',
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
    tableName: 'C052_unidadeDeposito',
    timestamps: false,
    underscored: false,
  }
);

// Setup associations
UnidadeDeposito.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
UnidadeDeposito.belongsTo(UnidadeMedida, { foreignKey: 'idUnidadeMedida', as: 'unidadeMedida' });
UnidadeDeposito.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });

export default UnidadeDeposito;
