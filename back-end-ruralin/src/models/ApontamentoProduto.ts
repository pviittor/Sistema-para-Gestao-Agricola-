import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Apontamento from './Apontamento';
import Produto from './Produto';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ApontamentoProduto
 */
interface ApontamentoProdutoAttributes {
  id_aptprod: number;
  tenantId: number;
  idApontamento: number;
  idProduto: number;
  quantidade: number;
  valor: number;
  temperatura: number;
  umidade: number;
  periodo: number;
  data: string;
  numero: number;
  observacao?: string | null;
  area: number;
  dosagem: number;
  produtoConvertidoMoeda: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_aptprod é opcional pois é auto-increment)
 */
interface ApontamentoProdutoCreationAttributes extends Optional<ApontamentoProdutoAttributes, 'id_aptprod' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ApontamentoProduto
 *
 * Registro de produtos utilizados em apontamentos agrícolas
 */
class ApontamentoProduto
  extends Model<ApontamentoProdutoAttributes, ApontamentoProdutoCreationAttributes>
  implements ApontamentoProdutoAttributes
{
  public id_aptprod!: number;
  public tenantId!: number;
  public idApontamento!: number;
  public idProduto!: number;
  public quantidade!: number;
  public valor!: number;
  public temperatura!: number;
  public umidade!: number;
  public periodo!: number;
  public data!: string;
  public numero!: number;
  public observacao!: string | null;
  public area!: number;
  public dosagem!: number;
  public produtoConvertidoMoeda!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public apontamento?: Apontamento;
  public produto?: Produto;
  public usuarioCriador?: Usuario;
}

ApontamentoProduto.init(
  {
    id_aptprod: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do apontamento de produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    idApontamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do apontamento relacionado',
      references: {
        model: 'C038_apontamento',
        key: 'id_apt',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto utilizado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Quantidade do produto',
    },
    valor: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor do produto',
    },
    temperatura: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Temperatura registrada',
    },
    umidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Umidade registrada',
    },
    periodo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Período do apontamento',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do apontamento de produto',
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Número sequencial',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais',
    },
    area: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Área aplicada',
    },
    dosagem: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Dosagem aplicada',
    },
    produtoConvertidoMoeda: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o produto foi convertido para moeda',
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
    tableName: 'C040_apontamentoProduto',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idApontamento'],
      },
      {
        fields: ['idProduto'],
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
ApontamentoProduto.belongsTo(Apontamento, { foreignKey: 'idApontamento', as: 'apontamento' });
ApontamentoProduto.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });
ApontamentoProduto.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ApontamentoProduto;
