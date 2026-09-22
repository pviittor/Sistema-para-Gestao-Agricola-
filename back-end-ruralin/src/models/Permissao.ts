import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface PermissaoAttributes {
  id: number;
  nome: string;
}

interface PermissaoCreationAttributes extends Optional<PermissaoAttributes, "id"> {}

class Permissao
  extends Model<PermissaoAttributes, PermissaoCreationAttributes>
  implements PermissaoAttributes
{
  public id!: number;
  public nome!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permissao.init(
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
    tableName: "permissoes",
  }
);

export default Permissao;
