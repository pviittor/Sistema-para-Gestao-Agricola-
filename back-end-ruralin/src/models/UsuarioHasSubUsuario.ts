import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";

interface UsuarioHasSubUsuarioAttributes {
  usuarioId: number;
  subUsuarioId: number;
}

interface UsuarioHasSubUsuarioCreationAttributes extends Optional<UsuarioHasSubUsuarioAttributes, "usuarioId" | "subUsuarioId"> {}

class UsuarioHasSubUsuario
  extends Model<UsuarioHasSubUsuarioAttributes, UsuarioHasSubUsuarioCreationAttributes>
  implements UsuarioHasSubUsuarioAttributes
{
  public usuarioId!: number;
  public subUsuarioId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UsuarioHasSubUsuario.init(
  {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
    subUsuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "usuario_has_subUsuario",
  }
);

export default UsuarioHasSubUsuario;
