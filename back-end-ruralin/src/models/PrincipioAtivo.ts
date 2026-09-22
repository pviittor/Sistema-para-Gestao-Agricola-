import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade PrincipioAtivo
 */
interface PrincipioAtivoAttributes {
  id_principio: number;
  tenantId: number;
  descricao_principio: string;
  classe_principio?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_principio é opcional pois é auto-increment)
 */
interface PrincipioAtivoCreationAttributes extends Optional<PrincipioAtivoAttributes, 'id_principio' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade PrincipioAtivo
 * 
 * Princípios ativos de produtos agrícolas
 */
class PrincipioAtivo
  extends Model<PrincipioAtivoAttributes, PrincipioAtivoCreationAttributes>
  implements PrincipioAtivoAttributes
{
  public id_principio!: number;
  public tenantId!: number;
  public descricao_principio!: string;
  public classe_principio!: string | null;
  public usercreation!: number;
  public datecreation!: Date;
}

PrincipioAtivo.init(
  {
    id_principio: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do princípio ativo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId', // Mapear explicitamente para tenantId (não tenant_id)
      comment: 'ID do tenant ao qual o princípio ativo pertence',
    },
    descricao_principio: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do princípio ativo',
    },
    classe_principio: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Classe do princípio ativo',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
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
    tableName: 'C004_PrincipioAtivo',
    timestamps: false, // Usa datecreation ao invés de createdAt/updatedAt
    underscored: false, // Mantém os nomes dos campos como estão
  }
);

// Setup association
PrincipioAtivo.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default PrincipioAtivo;
