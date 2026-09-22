import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

interface LembreteAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  desc_simples: string;
  desc_completa: string;
}

interface LembreteCreationAttributes extends Optional<LembreteAttributes, 'id'> {}

class Lembrete extends Model<LembreteAttributes, LembreteCreationAttributes> implements LembreteAttributes {
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public desc_simples!: string;
  public desc_completa!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Lembrete.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: 'ID do tenant ao qual o lembrete pertence',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    desc_simples: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    desc_completa: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'lembretes',
  }
);

export default Lembrete;
