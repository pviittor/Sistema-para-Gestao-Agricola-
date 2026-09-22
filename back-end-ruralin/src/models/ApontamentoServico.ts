import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Apontamento from './Apontamento';
import ServicoAgricola from './ServicoAgricola';
import Pessoa from './Pessoa';
import Moeda from './Moeda';
import TituloPagar from './TituloPagar';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade ApontamentoServico
 */
interface ApontamentoServicoAttributes {
  id_aptsrv: number;
  tenantId: number;
  idApontamento: number;
  idServico: number;
  idResponsavel: number;
  idMoeda?: number | null;
  idPagar?: number | null;
  data: string;
  valor: number;
  tempo: number;
  observacao?: string | null;
  quantidadeTon: number;
  unitarioTon: number;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_aptsrv é opcional pois é auto-increment)
 */
interface ApontamentoServicoCreationAttributes extends Optional<ApontamentoServicoAttributes, 'id_aptsrv' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade ApontamentoServico
 *
 * Registro de serviços realizados em apontamentos agrícolas
 */
class ApontamentoServico
  extends Model<ApontamentoServicoAttributes, ApontamentoServicoCreationAttributes>
  implements ApontamentoServicoAttributes
{
  public id_aptsrv!: number;
  public tenantId!: number;
  public idApontamento!: number;
  public idServico!: number;
  public idResponsavel!: number;
  public idMoeda!: number | null;
  public idPagar!: number | null;
  public data!: string;
  public valor!: number;
  public tempo!: number;
  public observacao!: string | null;
  public quantidadeTon!: number;
  public unitarioTon!: number;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public apontamento?: Apontamento;
  public servico?: ServicoAgricola;
  public responsavel?: Pessoa;
  public moeda?: Moeda;
  public tituloPagar?: TituloPagar;
  public usuarioCriador?: Usuario;
}

ApontamentoServico.init(
  {
    id_aptsrv: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do apontamento de serviço',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    idApontamento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do apontamento relacionado',
      references: {
        model: 'C038_apontamento',
        key: 'id_apt',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idServico: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do serviço agrícola',
      references: {
        model: 'C010_servicoAgricola',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idResponsavel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do responsável pelo serviço (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idMoeda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da moeda utilizada',
      references: {
        model: 'C006_moeda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idPagar: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do título a pagar relacionado',
      references: {
        model: 'C019_tituloPagar',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do serviço',
    },
    valor: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor do serviço',
    },
    tempo: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Tempo gasto no serviço',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais',
    },
    quantidadeTon: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Quantidade em toneladas',
    },
    unitarioTon: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor unitário por tonelada',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criação do registro',
    },
  },
  {
    sequelize,
    tableName: 'C041_apontamentoServico',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idApontamento'],
      },
      {
        fields: ['idServico'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
ApontamentoServico.belongsTo(Apontamento, { foreignKey: 'idApontamento', as: 'apontamento' });
ApontamentoServico.belongsTo(ServicoAgricola, { foreignKey: 'idServico', as: 'servico' });
ApontamentoServico.belongsTo(Pessoa, { foreignKey: 'idResponsavel', as: 'responsavel' });
ApontamentoServico.belongsTo(Moeda, { foreignKey: 'idMoeda', as: 'moeda' });
ApontamentoServico.belongsTo(TituloPagar, { foreignKey: 'idPagar', as: 'tituloPagar' });
ApontamentoServico.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default ApontamentoServico;
