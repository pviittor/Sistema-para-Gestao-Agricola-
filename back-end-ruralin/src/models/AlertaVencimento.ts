import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import AlertaVencimentoConfig from './AlertaVencimentoConfig';

export enum TipoAlerta {
  ANTECIPADO = 'ANTECIPADO',
  NO_VENCIMENTO = 'NO_VENCIMENTO',
  VENCIDO = 'VENCIDO',
}

export enum TipoParcelaAlerta {
  PAGAR = 'PAGAR',
  RECEBER = 'RECEBER',
}

interface AlertaVencimentoAttributes {
  id: number;
  tenantId: number;
  usuarioId: number;
  alertaVencimentoConfigId: number;
  tipoParcela: TipoParcelaAlerta;
  idParcela: number;
  idTitulo: number;
  dataVencimentoParcela: Date;
  dataAlerta: Date;
  tipoAlerta: TipoAlerta;
  diasAntecedencia: number;
  mensagem: string;
  valorSaldo: number;
  lido: boolean;
  datecreation: Date;
}

interface AlertaVencimentoCreationAttributes extends Optional<AlertaVencimentoAttributes,
  'id' | 'datecreation' | 'lido' | 'diasAntecedencia'
> {}

class AlertaVencimento
  extends Model<AlertaVencimentoAttributes, AlertaVencimentoCreationAttributes>
  implements AlertaVencimentoAttributes
{
  public id!: number;
  public tenantId!: number;
  public usuarioId!: number;
  public alertaVencimentoConfigId!: number;
  public tipoParcela!: TipoParcelaAlerta;
  public idParcela!: number;
  public idTitulo!: number;
  public dataVencimentoParcela!: Date;
  public dataAlerta!: Date;
  public tipoAlerta!: TipoAlerta;
  public diasAntecedencia!: number;
  public mensagem!: string;
  public valorSaldo!: number;
  public lido!: boolean;
  public datecreation!: Date;

  public usuario?: Usuario;
  public config?: AlertaVencimentoConfig;
}

AlertaVencimento.init(
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
    alertaVencimentoConfigId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'alerta_vencimento_config', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tipoParcela: {
      type: DataTypes.ENUM('PAGAR', 'RECEBER'),
      allowNull: false,
    },
    idParcela: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da parcela (C020 ou C024)',
    },
    idTitulo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do título pai (C019 ou C023)',
    },
    dataVencimentoParcela: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dataAlerta: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    tipoAlerta: {
      type: DataTypes.ENUM('ANTECIPADO', 'NO_VENCIMENTO', 'VENCIDO'),
      allowNull: false,
    },
    diasAntecedencia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    mensagem: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    valorSaldo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    lido: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'alerta_vencimento',
    timestamps: false,
    underscored: false,
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['usuarioId'] },
      { fields: ['tipoParcela', 'idParcela', 'dataAlerta'] },
      { fields: ['lido'] },
    ],
  }
);

AlertaVencimento.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
AlertaVencimento.belongsTo(AlertaVencimentoConfig, { foreignKey: 'alertaVencimentoConfigId', as: 'config' });
AlertaVencimentoConfig.hasMany(AlertaVencimento, { foreignKey: 'alertaVencimentoConfigId', as: 'alertas' });

export default AlertaVencimento;
