import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Interface para atributos da entidade ListaBancos
 */
interface ListaBancosAttributes {
  id: number;
  codigo: string;
  nome: string;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface ListaBancosCreationAttributes extends Optional<ListaBancosAttributes, 'id'> {}

/**
 * Modelo Sequelize para a entidade ListaBancos
 * 
 * Tabela de referência para lista de bancos utilizados nas contas.
 */
class ListaBancos
  extends Model<ListaBancosAttributes, ListaBancosCreationAttributes>
  implements ListaBancosAttributes
{
  public id!: number;
  public codigo!: string;
  public nome!: string;
}

ListaBancos.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do banco',
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Código do banco (ex: 001, 237)',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do banco',
    },
  },
  {
    sequelize,
    tableName: 'lista_bancos',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        name: 'idx_lista_bancos_codigo',
        unique: true,
        fields: ['codigo'],
      },
    ],
  }
);

export default ListaBancos;
