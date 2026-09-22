import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Lembrete from './Lembrete';

interface LembreteDataHoraAttributes {
  id: number;
  tenantId: number;
  lembreteId: number;
  dia: string;
  data: string;
  horario: string;
}

interface LembreteDataHoraCreationAttributes extends Optional<LembreteDataHoraAttributes, 'id'> {}

class LembreteDataHora extends Model<LembreteDataHoraAttributes, LembreteDataHoraCreationAttributes> implements LembreteDataHoraAttributes {
  public id!: number;
  public tenantId!: number;
  public lembreteId!: number;
  public dia!: string;
  public data!: string;
  public horario!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LembreteDataHora.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: 'ID do tenant ao qual o lembrete_data_hora pertence',
    },
    lembreteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Lembrete,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    dia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    data: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    horario: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'lembretes_data_hora',
  }
);

// Associations
Lembrete.hasMany(LembreteDataHora, { foreignKey: 'lembreteId', as: 'lembrete_data_hora' });
LembreteDataHora.belongsTo(Lembrete, { foreignKey: 'lembreteId', as: 'lembrete' });

export default LembreteDataHora;
