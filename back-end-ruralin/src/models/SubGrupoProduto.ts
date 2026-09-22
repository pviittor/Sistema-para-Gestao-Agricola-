import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import GrupoProduto from './GrupoProduto';

/**
 * Interface para atributos da entidade SubGrupoProduto
 */
interface SubGrupoProdutoAttributes {
  id_sub: number;
  tenantId: number;
  descricao_sub: string;
  idGrupo: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id_sub é opcional pois é auto-increment)
 */
interface SubGrupoProdutoCreationAttributes extends Optional<SubGrupoProdutoAttributes, 'id_sub' | 'createdAt' | 'updatedAt'> {}

/**
 * Modelo Sequelize para a entidade SubGrupoProduto
 * 
 * Subgrupos de produtos para organização hierárquica dentro dos grupos
 */
class SubGrupoProduto
  extends Model<SubGrupoProdutoAttributes, SubGrupoProdutoCreationAttributes>
  implements SubGrupoProdutoAttributes
{
  public id_sub!: number;
  public tenantId!: number;
  public descricao_sub!: string;
  public idGrupo!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SubGrupoProduto.init(
  {
    id_sub: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do subgrupo de produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId', // Mapear explicitamente para tenantId (não tenant_id)
      comment: 'ID do tenant ao qual o subgrupo de produto pertence',
    },
    descricao_sub: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do subgrupo de produto',
    },
    idGrupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'idGrupo', // Mapear explicitamente para idGrupo (não id_grupo)
      comment: 'ID do grupo de produto ao qual o subgrupo pertence',
      references: {
        model: 'grupos_produto',
        key: 'id',
      },
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
    tableName: 'C003_SubGrupoProduto',
    timestamps: true,
    underscored: true,
  }
);

// Setup association
SubGrupoProduto.belongsTo(GrupoProduto, { foreignKey: 'idGrupo', as: 'grupo' });

export default SubGrupoProduto;
