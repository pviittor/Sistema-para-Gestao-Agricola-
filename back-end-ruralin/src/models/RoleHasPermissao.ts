import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Role from "./Role";
import Permissao from "./Permissao";

interface RoleHasPermissaoAttributes {
  roleId: number;
  permissaoId: number;
}

interface RoleHasPermissaoCreationAttributes extends Optional<RoleHasPermissaoAttributes, "roleId" | "permissaoId"> {}

class RoleHasPermissao
  extends Model<RoleHasPermissaoAttributes, RoleHasPermissaoCreationAttributes>
  implements RoleHasPermissaoAttributes
{
  public roleId!: number;
  public permissaoId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoleHasPermissao.init(
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
    permissaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permissao,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "role_has_permissao",
  }
);

export default RoleHasPermissao;
