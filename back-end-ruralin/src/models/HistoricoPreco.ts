import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Produto from './Produto';
import Fazenda from './Fazenda';
import MovimentoEstoque from './MovimentoEstoque';
import Moeda from './Moeda';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade HistoricoPreco
 */
interface HistoricoPrecoAttributes {
  id_hist: number;
  tenantId: number;
  idProduto: number;
  idFazenda: number;
  idMovimentoEstoque: number;
  preco: number;
  quantidade: number;
  data: string;
  idMoeda?: number | null;
  valorMoedaPadrao: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_hist é opcional pois é auto-increment)
 */
interface HistoricoPrecoCreationAttributes extends Optional<HistoricoPrecoAttributes, 'id_hist' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade HistoricoPreco
 *
 * Histórico de preços de produtos, gerado automaticamente a cada movimento de estoque
 * quando tipomov in [0 (Pedido Compra), 3 (Tomado Empréstimo), 4 (Estoque Inicial)]
 */
class HistoricoPreco
  extends Model<HistoricoPrecoAttributes, HistoricoPrecoCreationAttributes>
  implements HistoricoPrecoAttributes
{
  public id_hist!: number;
  public tenantId!: number;
  public idProduto!: number;
  public idFazenda!: number;
  public idMovimentoEstoque!: number;
  public preco!: number;
  public quantidade!: number;
  public data!: string;
  public idMoeda!: number | null;
  public valorMoedaPadrao!: number;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public produto?: Produto;
  public fazenda?: Fazenda;
  public movimentoEstoque?: MovimentoEstoque;
  public moeda?: Moeda;
  public usuarioCriador?: Usuario;
}

HistoricoPreco.init(
  {
    id_hist: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do histórico de preço',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o histórico pertence',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    idMovimentoEstoque: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do movimento de estoque que gerou o histórico',
      references: {
        model: 'C032_movimentoEstoque',
        key: 'id_mov',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    preco: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Preço registrado',
    },
    quantidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Quantidade movimentada',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do registro de preço',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da moeda (indexador do produto)',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    valorMoedaPadrao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor convertido para moeda padrão',
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
    tableName: 'C033_historicoPreco',
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
        fields: ['idMovimentoEstoque'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['idProduto', 'idFazenda', 'data'],
        name: 'idx_histPreco_produto_fazenda_data',
      },
    ],
  }
);

// Setup associations
HistoricoPreco.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });
HistoricoPreco.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
HistoricoPreco.belongsTo(MovimentoEstoque, { foreignKey: 'idMovimentoEstoque', as: 'movimentoEstoque' });
HistoricoPreco.belongsTo(Moeda, { foreignKey: 'idMoeda', as: 'moeda' });
HistoricoPreco.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default HistoricoPreco;
