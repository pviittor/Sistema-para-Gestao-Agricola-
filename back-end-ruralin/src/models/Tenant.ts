import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Interface para atributos da entidade Tenant
 */
interface TenantAttributes {
  id: number;
  consultoriaId: number;
  nome: string;
  slug: string;
  ativo: boolean;
  dataAtivacao: Date;
  dataDesativacao?: Date | null;
  configuracoes?: Record<string, any> | null;
  limiteUsuarios: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface TenantCreationAttributes extends Optional<TenantAttributes, "id" | "configuracoes" | "dataDesativacao"> {}

/**
 * Modelo Sequelize para a entidade Tenant
 * 
 * Representa um tenant que pertence a uma consultoria.
 * Usuários do tipo ROOT e CLIENT pertencem a um tenant.
 */
class Tenant
  extends Model<TenantAttributes, TenantCreationAttributes>
  implements TenantAttributes
{
  public id!: number;
  public consultoriaId!: number;
  public nome!: string;
  public slug!: string;
  public ativo!: boolean;
  public dataAtivacao!: Date;
  public dataDesativacao!: Date | null;
  public configuracoes!: Record<string, any> | null;
  public limiteUsuarios!: number;
  public usercreation!: number;
  public datecreation!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tenant.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    consultoriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da consultoria à qual o tenant pertence',
      references: {
        model: 'C011_consultoria',
        key: 'id',
      },
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome do tenant',
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      comment: 'Slug único do tenant (para URLs/subdomínios)',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se o tenant está ativo',
    },
    dataAtivacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de ativação do tenant',
    },
    dataDesativacao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de desativação do tenant',
    },
    configuracoes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configurações específicas do tenant',
    },
    limiteUsuarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: 'Limite de usuários permitidos para este tenant',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o tenant',
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação do tenant',
    },
  },
  {
    sequelize,
    tableName: "C012_tenant",
    underscored: false,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['slug'],
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['consultoriaId'],
      },
      {
        fields: ['consultoriaId', 'ativo'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Relacionamentos serão definidos após a inicialização para evitar referência circular

export default Tenant;
