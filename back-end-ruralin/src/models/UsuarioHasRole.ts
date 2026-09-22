import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";
import Role from "./Role";

interface UsuarioHasRoleAttributes {
  tenantId: number;
  usuarioId: number;
  roleId: number;
}

interface UsuarioHasRoleCreationAttributes extends Optional<UsuarioHasRoleAttributes, "tenantId" | "usuarioId" | "roleId"> {}

class UsuarioHasRole
  extends Model<UsuarioHasRoleAttributes, UsuarioHasRoleCreationAttributes>
  implements UsuarioHasRoleAttributes
{
  public tenantId!: number;
  public usuarioId!: number;
  public roleId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsuarioHasRole.init(
  {
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: 'ID do tenant ao qual o relacionamento usuario-role pertence',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "usuario_has_role",
  }
);

export default UsuarioHasRole;
