import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

export enum TipoTituloAlerta {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
  AMBOS = 'AMBOS',
}

interface AlertaVencimentoConfigAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  tipoTitulo: TipoTituloAlerta;
  antecedenciaAlerta1Dias?: number | null;
  antecedenciaAlerta2Dias?: number | null;
  antecedenciaAlerta3Dias?: number | null;
  notificarNoVencimento: boolean;
  notificarVencidos: boolean;
  frequenciaRenotificacaoVencidosDias?: number | null;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

interface AlertaVencimentoConfigCreationAttributes extends Optional<AlertaVencimentoConfigAttributes,
  'id' | 'datecreation' | 'antecedenciaAlerta1Dias' | 'antecedenciaAlerta2Dias' | 'antecedenciaAlerta3Dias' |
  'notificarNoVencimento' | 'notificarVencidos' | 'frequenciaRenotificacaoVencidosDias' | 'ativo'
> {}

class AlertaVencimentoConfig
  extends Model<AlertaVencimentoConfigAttributes, AlertaVencimentoConfigCreationAttributes>
  implements AlertaVencimentoConfigAttributes
{
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public tipoTitulo!: TipoTituloAlerta;
  public antecedenciaAlerta1Dias!: number | null;
  public antecedenciaAlerta2Dias!: number | null;
  public antecedenciaAlerta3Dias!: number | null;
  public notificarNoVencimento!: boolean;
  public notificarVencidos!: boolean;
  public frequenciaRenotificacaoVencidosDias!: number | null;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  public usuario?: Usuario;
}

AlertaVencimentoConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tipoTitulo: {
      type: DataTypes.ENUM('PAGAR', 'RECEBER', 'AMBOS'),
      allowNull: false,
      comment: 'Tipo de título a monitorar',
    },
    antecedenciaAlerta1Dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
    },
    antecedenciaAlerta2Dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
    antecedenciaAlerta3Dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    notificarNoVencimento: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notificarVencidos: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    frequenciaRenotificacaoVencidosDias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'usuarios', key: 'id' },
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'alerta_vencimento_config',
    timestamps: false,
    underscored: false,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['usuarioId', 'tenantId', 'tipoTitulo'], unique: true },
      { fields: ['ativo'] },
    ],
  }
);

AlertaVencimentoConfig.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
AlertaVencimentoConfig.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default AlertaVencimentoConfig;
