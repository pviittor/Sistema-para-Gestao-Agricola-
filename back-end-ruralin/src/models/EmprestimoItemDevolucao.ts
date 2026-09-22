import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import EmprestimoItem from './EmprestimoItem';
import Produto from './Produto';

/**
 * Interface para atributos da entidade EmprestimoItemDevolucao
 */
interface EmprestimoItemDevolucaoAttributes {
  id: number;
  itemDevolucaoId: number;
  produtoDevolucaoId: number;
  produtoSimilarId: number | null;
  datadevolucao_empdev: string;
  quantidadedevolvida_empdev: number;
  devolucaoGeraFinanceiro_empdev: boolean;
  devolucaoProdutoSimilar_empdev: boolean;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface EmprestimoItemDevolucaoCreationAttributes
  extends Optional<EmprestimoItemDevolucaoAttributes, 'id' | 'produtoSimilarId'> {}

/**
 * Modelo Sequelize para a entidade EmprestimoItemDevolucao
 *
 * Representa a devolução de um item de empréstimo, podendo ser do
 * mesmo produto ou de produto similar.
 * Não é multi-tenant — herdamos o tenant pelo empréstimo pai.
 */
class EmprestimoItemDevolucao
  extends Model<EmprestimoItemDevolucaoAttributes, EmprestimoItemDevolucaoCreationAttributes>
  implements EmprestimoItemDevolucaoAttributes
{
  public id!: number;
  public itemDevolucaoId!: number;
  public produtoDevolucaoId!: number;
  public produtoSimilarId!: number | null;
  public datadevolucao_empdev!: string;
  public quantidadedevolvida_empdev!: number;
  public devolucaoGeraFinanceiro_empdev!: boolean;
  public devolucaoProdutoSimilar_empdev!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos
  public item?: EmprestimoItem;
  public produtoDevolucao?: Produto;
  public produtoSimilar?: Produto;
}

EmprestimoItemDevolucao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da devolução do item do empréstimo (auto-increment)',
    },
    itemDevolucaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do item do empréstimo que está sendo devolvido',
      references: {
        model: 'emprestimo_itens',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    produtoDevolucaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto que está sendo devolvido',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    produtoSimilarId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do produto similar devolvido (quando a devolução é de produto similar)',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    datadevolucao_empdev: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data da devolução do item',
    },
    quantidadedevolvida_empdev: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      comment: 'Quantidade devolvida nesta operação',
    },
    devolucaoGeraFinanceiro_empdev: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se a devolução gera um lançamento financeiro',
    },
    devolucaoProdutoSimilar_empdev: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se a devolução é de produto similar ao emprestado',
    },
  },
  {
    sequelize,
    tableName: 'emprestimo_item_devolucoes',
    timestamps: true,
    indexes: [
      { fields: ['itemDevolucaoId'] },
      { fields: ['produtoDevolucaoId'] },
      { fields: ['produtoSimilarId'] },
    ],
  }
);

// Setup associations
EmprestimoItemDevolucao.belongsTo(EmprestimoItem, { foreignKey: 'itemDevolucaoId', as: 'item', onDelete: 'CASCADE' });
EmprestimoItemDevolucao.belongsTo(Produto, { foreignKey: 'produtoDevolucaoId', as: 'produtoDevolucao', onDelete: 'RESTRICT' });
EmprestimoItemDevolucao.belongsTo(Produto, { foreignKey: 'produtoSimilarId', as: 'produtoSimilar', onDelete: 'SET NULL' });

// Associação inversa: EmprestimoItem possui muitas devoluções
EmprestimoItem.hasMany(EmprestimoItemDevolucao, { foreignKey: 'itemDevolucaoId', as: 'devolucoes', onDelete: 'CASCADE' });

export default EmprestimoItemDevolucao;
