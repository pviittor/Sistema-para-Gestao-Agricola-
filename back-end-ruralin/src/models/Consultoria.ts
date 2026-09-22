import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

/**
 * Interface para atributos da entidade Consultoria
 */
interface ConsultoriaAttributes {
  id: number;
  tenantId?: number | null;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj: string;
  email: string;
  telefone?: string | null;
  ativo: boolean;
  dataAtivacao: Date;
  dataDesativacao?: Date | null;
  limiteTenants: number;
  tenantCount: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface ConsultoriaCreationAttributes extends Optional<ConsultoriaAttributes, "id" | "tenantId" | "nomeFantasia" | "telefone" | "dataDesativacao"> {}

/**
 * Modelo Sequelize para a entidade Consultoria
 * 
 * Representa uma consultoria que pode possuir múltiplos tenants.
 * Usuários do tipo CONSULTOR pertencem a uma consultoria.
 */
class Consultoria
  extends Model<ConsultoriaAttributes, ConsultoriaCreationAttributes>
  implements ConsultoriaAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public razaoSocial!: string;
  public nomeFantasia!: string | null;
  public cnpj!: string;
  public email!: string;
  public telefone!: string | null;
  public ativo!: boolean;
  public dataAtivacao!: Date;
  public dataDesativacao!: Date | null;
  public limiteTenants!: number;
  public tenantCount!: number;
  public usercreation!: number;
  public datecreation!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Consultoria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do tenant da consultoria (opcional)',
    },
    razaoSocial: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Razão social da consultoria',
    },
    nomeFantasia: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nome fantasia da consultoria',
    },
    cnpj: {
      type: DataTypes.STRING(18),
      allowNull: false,
      unique: true,
      comment: 'CNPJ da consultoria (único)',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Email de contato da consultoria',
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Telefone de contato da consultoria',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a consultoria está ativa',
    },
    dataAtivacao: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de ativação da consultoria',
    },
    dataDesativacao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de desativação da consultoria',
    },
    limiteTenants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: 'Limite de tenants permitidos para esta consultoria',
    },
    tenantCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantidade atual de tenants (calculado)',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou a consultoria',
      references: {
        model: 'usuarios',
        key: 'id',
      },
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação da consultoria',
    },
  },
  {
    sequelize,
    tableName: "C011_consultoria",
    underscored: false,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['cnpj'],
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Relacionamento com Usuario será definido após a inicialização para evitar referência circular

export default Consultoria;
