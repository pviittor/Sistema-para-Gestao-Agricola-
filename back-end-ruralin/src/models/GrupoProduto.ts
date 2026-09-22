import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * Interface para atributos da entidade GrupoProduto
 */
interface GrupoProdutoAttributes {
  id: number;
  tenantId: number;
  descricao_grupo: string;
  abreviacao_grupo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface GrupoProdutoCreationAttributes extends Optional<GrupoProdutoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Modelo Sequelize para a entidade GrupoProduto
 * 
 * Grupos de produtos para organização e categorização
 */
class GrupoProduto
  extends Model<GrupoProdutoAttributes, GrupoProdutoCreationAttributes>
  implements GrupoProdutoAttributes
{
  public id!: number;
  public tenantId!: number;
  public descricao_grupo!: string;
  public abreviacao_grupo!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GrupoProduto.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do grupo de produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId', // Mapear explicitamente para tenantId (não tenant_id)
      comment: 'ID do tenant ao qual o grupo de produto pertence',
    },
    descricao_grupo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do grupo de produto',
    },
    abreviacao_grupo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Abreviação do grupo de produto',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'createdAt', // Mapear explicitamente para createdAt (não created_at)
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updatedAt', // Mapear explicitamente para updatedAt (não updated_at)
    },
  },
  {
    sequelize,
    tableName: 'grupos_produto',
    timestamps: true,
    underscored: true,
  }
);

export default GrupoProduto;
