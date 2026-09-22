import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Produto from './Produto';
import Pessoa from './Pessoa';
import Fazenda from './Fazenda';
import Abastecimento from './Abastecimento';
import ApontamentoProduto from './ApontamentoProduto';
import ProdutoBenfeitoria from './ProdutoBenfeitoria';
import ItemNotaFiscal from './ItemNotaFiscal';
import OrdemServicoInsumo from './OrdemServicoInsumo';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade MovimentoEstoque
 */
interface MovimentoEstoqueAttributes {
  id_mov: number;
  tenantId: number;
  idProduto: number;
  idProdutor?: number | null;
  idFazenda: number;
  idAbastecimento?: number | null;
  idApontamentoProduto?: number | null;
  idProdutoBenfeitoria?: number | null;
  idItemNotaFiscal?: number | null;
  idOrdemServicoInsumo?: number | null;
  tipomov: number;
  operacao: number;
  quantidade: number;
  data: string;
  valor: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_mov é opcional pois é auto-increment)
 */
interface MovimentoEstoqueCreationAttributes extends Optional<MovimentoEstoqueAttributes, 'id_mov' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade MovimentoEstoque
 *
 * Registro de movimentações de estoque de produtos
 */
class MovimentoEstoque
  extends Model<MovimentoEstoqueAttributes, MovimentoEstoqueCreationAttributes>
  implements MovimentoEstoqueAttributes
{
  public id_mov!: number;
  public tenantId!: number;
  public idProduto!: number;
  public idProdutor!: number | null;
  public idFazenda!: number;
  public idAbastecimento!: number | null;
  public idApontamentoProduto!: number | null;
  public idProdutoBenfeitoria!: number | null;
  public idItemNotaFiscal!: number | null;
  public idOrdemServicoInsumo!: number | null;
  public tipomov!: number;
  public operacao!: number;
  public quantidade!: number;
  public data!: string;
  public valor!: number;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public produto?: Produto;
  public produtor?: Pessoa;
  public fazenda?: Fazenda;
  public abastecimento?: Abastecimento;
  public apontamentoProduto?: any;
  public produtoBenfeitoria?: any;
  public itemNotaFiscal?: ItemNotaFiscal;
  public ordemServicoInsumo?: OrdemServicoInsumo;
  public usuarioCriador?: Usuario;
}

MovimentoEstoque.init(
  {
    id_mov: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do movimento de estoque',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o movimento pertence',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto movimentado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idProdutor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do produtor do movimento (quando romaneio)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idFazenda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da fazenda (depósito)',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idAbastecimento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do abastecimento relacionado',
      references: {
        model: 'C031_abastecimento',
        key: 'id_abast',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idApontamentoProduto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do apontamento de produto relacionado',
      references: {
        model: 'C040_apontamentoProduto',
        key: 'id_aptprod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idProdutoBenfeitoria: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do produto benfeitoria relacionado',
      references: {
        model: 'C043_produtoBenfeitoria',
        key: 'id_prodbenf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idItemNotaFiscal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do item de nota fiscal relacionado',
      references: {
        model: 'C046_itemNotaFiscal',
        key: 'id_item_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idOrdemServicoInsumo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do insumo de ordem de serviço relacionado',
      references: {
        model: 'C070_ordemServicoInsumo',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    tipomov: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tipo de movimentação (0=PedidoCompra, 1=EstoqueFisico, 2=Emprestado, 3=TomadoEmprestimo, 4=EstoqueInicial, 5=ContratoReceber)',
    },
    operacao: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Operação de estoque (1=EstoqueFisico, 2=PedidoCompra, 4=CompraEntregaFutura, 5=VendaFutura, 6=Trading, 7=Disponivel, 71=DisponivelUso, 9=Balcao, 51=Terceiro)',
    },
    quantidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Quantidade movimentada',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do movimento',
    },
    valor: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor do movimento',
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
    tableName: 'C032_movimentoEstoque',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idProduto'],
      },
      {
        fields: ['idFazenda'],
      },
      {
        fields: ['idProdutor'],
      },
      {
        fields: ['operacao'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['idApontamentoProduto'],
      },
      {
        fields: ['idProdutoBenfeitoria'],
      },
      {
        fields: ['idItemNotaFiscal'],
      },
      {
        fields: ['idOrdemServicoInsumo'],
      },
      {
        fields: ['idProduto', 'idFazenda', 'operacao', 'data'],
        name: 'idx_movEstoque_produto_fazenda_operacao_data',
      },
    ],
  }
);

// Setup associations
MovimentoEstoque.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });
MovimentoEstoque.belongsTo(Pessoa, { foreignKey: 'idProdutor', as: 'produtor' });
MovimentoEstoque.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
MovimentoEstoque.belongsTo(Abastecimento, { foreignKey: 'idAbastecimento', as: 'abastecimento' });
MovimentoEstoque.belongsTo(ApontamentoProduto, { foreignKey: 'idApontamentoProduto', as: 'apontamentoProduto' });
MovimentoEstoque.belongsTo(ProdutoBenfeitoria, { foreignKey: 'idProdutoBenfeitoria', as: 'produtoBenfeitoria' });
MovimentoEstoque.belongsTo(ItemNotaFiscal, { foreignKey: 'idItemNotaFiscal', as: 'itemNotaFiscal' });
MovimentoEstoque.belongsTo(OrdemServicoInsumo, { foreignKey: 'idOrdemServicoInsumo', as: 'ordemServicoInsumo' });
MovimentoEstoque.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default MovimentoEstoque;
