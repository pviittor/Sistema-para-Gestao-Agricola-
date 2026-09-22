import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface RoleAttributes {
  id: number;
  nome: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public id!: number;
  public nome!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: "roles",
  }
);

export default Role;
