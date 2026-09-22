import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Maquina from './Maquina';
import Pessoa from './Pessoa';
import Produto from './Produto';
import Fazenda from './Fazenda';
import Safra from './Safra';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade Abastecimento
 */
interface AbastecimentoAttributes {
  id_abast: number;
  tenantId: number;
  data: string;
  idMaquina: number;
  kminicio: number;
  kmfim: number;
  idOperador?: number | null;
  idCombustivel: number;
  volume: number;
  preco: number;
  total: number;
  idFazenda: number;
  idCicloAbastecimento?: number | null;
  idOperadorAbastecimento?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_abast é opcional pois é auto-increment)
 */
interface AbastecimentoCreationAttributes extends Optional<AbastecimentoAttributes, 'id_abast' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Abastecimento
 *
 * Registro de abastecimentos de máquinas/veículos
 */
class Abastecimento
  extends Model<AbastecimentoAttributes, AbastecimentoCreationAttributes>
  implements AbastecimentoAttributes
{
  public id_abast!: number;
  public tenantId!: number;
  public data!: string;
  public idMaquina!: number;
  public kminicio!: number;
  public kmfim!: number;
  public idOperador!: number | null;
  public idCombustivel!: number;
  public volume!: number;
  public preco!: number;
  public total!: number;
  public idFazenda!: number;
  public idCicloAbastecimento!: number | null;
  public idOperadorAbastecimento!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public maquina?: Maquina;
  public operador?: Pessoa;
  public combustivel?: Produto;
  public fazenda?: Fazenda;
  public cicloAbastecimento?: Safra;
  public operadorAbastecimento?: Pessoa;
  public usuarioCriador?: Usuario;
}

Abastecimento.init(
  {
    id_abast: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do abastecimento',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o abastecimento pertence',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do abastecimento',
    },
    idMaquina: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da máquina abastecida',
      references: {
        model: 'C030_maquina',
        key: 'id_mqn',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    kminicio: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Km/horímetro início',
    },
    kmfim: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Km/horímetro fim',
    },
    idOperador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do operador da máquina (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idCombustivel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do combustível usado (produto)',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    volume: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Volume abastecido (litros)',
    },
    preco: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Preço por litro',
    },
    total: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Total (volume × preço)',
    },
    idFazenda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da fazenda',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idCicloAbastecimento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do ciclo/safra de abastecimento',
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idOperadorAbastecimento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do operador do abastecimento (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
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
      comment: 'Data de criação do registro',
    },
  },
  {
    sequelize,
    tableName: 'C031_abastecimento',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idMaquina'],
      },
      {
        fields: ['idOperador'],
      },
      {
        fields: ['idCombustivel'],
      },
      {
        fields: ['idFazenda'],
      },
      {
        fields: ['idCicloAbastecimento'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Abastecimento.belongsTo(Maquina, { foreignKey: 'idMaquina', as: 'maquina' });
Abastecimento.belongsTo(Pessoa, { foreignKey: 'idOperador', as: 'operador' });
Abastecimento.belongsTo(Produto, { foreignKey: 'idCombustivel', as: 'combustivel' });
Abastecimento.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
Abastecimento.belongsTo(Safra, { foreignKey: 'idCicloAbastecimento', as: 'cicloAbastecimento' });
Abastecimento.belongsTo(Pessoa, { foreignKey: 'idOperadorAbastecimento', as: 'operadorAbastecimento' });
Abastecimento.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Abastecimento;
