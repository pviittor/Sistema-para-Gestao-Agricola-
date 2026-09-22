import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Emprestimo from './Emprestimo';
import Produto from './Produto';

/**
 * Interface para atributos da entidade EmprestimoItem
 */
interface EmprestimoItemAttributes {
  id: number;
  emprestimoId: number;
  produtoId: number;
  quantidade_empi: number;
  unitario_empi: number;
  total_empi: number;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface EmprestimoItemCreationAttributes
  extends Optional<EmprestimoItemAttributes, 'id' | 'total_empi'> {}

/**
 * Modelo Sequelize para a entidade EmprestimoItem
 *
 * Representa um item (produto) vinculado a um empréstimo.
 * Não é multi-tenant — herdamos o tenant pelo empréstimo pai.
 */
class EmprestimoItem
  extends Model<EmprestimoItemAttributes, EmprestimoItemCreationAttributes>
  implements EmprestimoItemAttributes
{
  public id!: number;
  public emprestimoId!: number;
  public produtoId!: number;
  public quantidade_empi!: number;
  public unitario_empi!: number;
  public total_empi!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos
  public emprestimo?: Emprestimo;
  public produto?: Produto;
}

EmprestimoItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do item do empréstimo (auto-increment)',
    },
    emprestimoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do empréstimo ao qual o item pertence',
      references: {
        model: 'emprestimos',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto emprestado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantidade_empi: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade do produto emprestado',
    },
    unitario_empi: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Valor unitário do produto emprestado',
    },
    total_empi: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total do item (quantidade_empi × unitario_empi)',
    },
  },
  {
    sequelize,
    tableName: 'emprestimo_itens',
    timestamps: true,
    indexes: [
      { fields: ['emprestimoId'] },
      { fields: ['produtoId'] },
    ],
  }
);

// Setup associations (ambas no arquivo do filho — anti-circular-import)
Emprestimo.hasMany(EmprestimoItem, { foreignKey: 'emprestimoId', as: 'itens', onDelete: 'CASCADE' });
EmprestimoItem.belongsTo(Emprestimo, { foreignKey: 'emprestimoId', as: 'emprestimo', onDelete: 'CASCADE' });
EmprestimoItem.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto', onDelete: 'RESTRICT' });

export default EmprestimoItem;
