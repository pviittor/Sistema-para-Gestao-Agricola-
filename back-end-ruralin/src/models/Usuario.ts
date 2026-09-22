import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface UsuarioAttributes {
  id: number;
  tenantId: number | null;
  consultoriaId: number | null;
  apiKey: string;
  apiUrl: string;
  tipo: string; // 'GOD' | 'CONSULTOR' | 'ROOT' | 'CLIENT'
  nome: string;
  username: string;
  email: string;
  senha?: string;
  whatsapp: string;
  roleIds: number[];
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, "id"> {}

class Usuario
  extends Model<UsuarioAttributes, UsuarioCreationAttributes>
  implements UsuarioAttributes
{
  public id!: number;
  public tenantId!: number | null;
  public consultoriaId!: number | null;
  public apiKey!: string;
  public apiUrl!: string;
  public tipo!: string;
  public nome!: string;
  public username!: string;
  public email!: string;
  public senha!: string;
  public whatsapp!: string;
  public roleIds!: number[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL para GOD e CONSULTOR, NOT NULL para ROOT e CLIENT
      comment: 'ID do tenant ao qual o usuário pertence (NULL para GOD e CONSULTOR)',
    },
    consultoriaId: {
      type: DataTypes.INTEGER,
      allowNull: true, // NULL para GOD, ROOT e CLIENT, NOT NULL para CONSULTOR
      comment: 'ID da consultoria à qual o usuário CONSULTOR pertence',
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apiUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Tipo de usuário: GOD, CONSULTOR, ROOT ou CLIENT',
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true removido - validação de unicidade feita no nível da aplicação (DTO e Application Service)
      // Isso evita o erro "Too many keys specified; max 64 keys allowed" do MariaDB
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roleIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
  },
  {
    sequelize,
    tableName: "usuarios",
  }
);

export default Usuario;
