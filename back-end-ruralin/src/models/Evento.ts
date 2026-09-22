import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Local from './Local';
import Usuario from './Usuario';

interface EventoAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  titulo: string;
  descricao: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  localId: number;
}

interface EventoCreationAttributes extends Optional<EventoAttributes, 'id'> {}

class Evento extends Model<EventoAttributes, EventoCreationAttributes> implements EventoAttributes {
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public titulo!: string;
  public descricao!: string;
  public data!: string;
  public horario_inicio!: string;
  public horario_fim!: string;
  public localId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Evento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: 'ID do tenant ao qual o evento pertence',
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
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    horario_inicio: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    horario_fim: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    localId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Local,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'eventos',
  }
);

// Setup association will be done centrally or here if simple
Evento.belongsTo(Local, { foreignKey: 'localId', as: 'local' });
Local.hasMany(Evento, { foreignKey: 'localId', as: 'eventos' });

export default Evento;
