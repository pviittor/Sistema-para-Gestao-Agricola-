import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Benfeitoria from './Benfeitoria';
import Produto from './Produto';
import Safra from './Safra';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ProdutoBenfeitoria
 */
interface ProdutoBenfeitoriaAttributes {
  id_prodbenf: number;
  tenantId: number;
  idBenfeitoria: number;
  idProduto: number;
  data: string;
  quantidade: number;
  unitario: number;
  observacao?: string | null;
  idSafra?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_prodbenf é opcional pois é auto-increment)
 */
interface ProdutoBenfeitoriaCreationAttributes extends Optional<ProdutoBenfeitoriaAttributes, 'id_prodbenf' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ProdutoBenfeitoria
 *
 * Registro de produtos utilizados em benfeitorias (patrimônio)
 */
class ProdutoBenfeitoria
  extends Model<ProdutoBenfeitoriaAttributes, ProdutoBenfeitoriaCreationAttributes>
  implements ProdutoBenfeitoriaAttributes
{
  public id_prodbenf!: number;
  public tenantId!: number;
  public idBenfeitoria!: number;
  public idProduto!: number;
  public data!: string;
  public quantidade!: number;
  public unitario!: number;
  public observacao!: string | null;
  public idSafra!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public benfeitoria?: Benfeitoria;
  public produto?: Produto;
  public safra?: Safra;
  public usuarioCriador?: Usuario;
}

ProdutoBenfeitoria.init(
  {
    id_prodbenf: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do produto benfeitoria',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    idBenfeitoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da benfeitoria relacionada',
      references: {
        model: 'C042_benfeitoria',
        key: 'id_benf',
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
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de utilização do produto',
    },
    quantidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Quantidade utilizada',
    },
    unitario: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor unitário do produto',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais',
    },
    idSafra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da safra',
      references: {
        model: 'C017_safra',
        key: 'id',
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
    tableName: 'C043_produtoBenfeitoria',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idBenfeitoria'],
      },
      {
        fields: ['idProduto'],
      },
      {
        fields: ['data'],
      },
    ],
  }
);

// Setup associations
ProdutoBenfeitoria.belongsTo(Benfeitoria, { foreignKey: 'idBenfeitoria', as: 'benfeitoria' });
ProdutoBenfeitoria.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });
ProdutoBenfeitoria.belongsTo(Safra, { foreignKey: 'idSafra', as: 'safra' });
ProdutoBenfeitoria.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ProdutoBenfeitoria;
