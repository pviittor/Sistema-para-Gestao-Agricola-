import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { TipoRegistroArmazenagem } from './enums/RegistroArmazenagemEnums';
import Produto from './Produto';
import UnidadeMedida from './UnidadeMedida';
import ConfiguradorCiclo from './ConfiguradorCiclo';
import UnidadeDeposito from './UnidadeDeposito';
import Pessoa from './Pessoa';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade RegistroArmazenagem
 */
interface RegistroArmazenagemAttributes {
  id: number;
  tenantId: number;
  tipo: TipoRegistroArmazenagem;
  data: string;
  hora?: string | null;
  idProduto: number;
  idUnidadeMedida: number;
  idOrigem: number;
  idUnidadeDeposito: number;
  idMotorista?: number | null;
  ticket?: string | null;
  placa: string | null;
  peso_bruto: number | null;
  peso_tara: number | null;
  peso_liquido: number;
  desconto_umidade: number;
  desconto_impureza: number;
  desconto_avariados: number;
  desconto_esverdeados: number;
  desconto_quebra_tecnica: number;
  desconto_taxa_recepcao: number;
  desconto_total: number;
  observacoes?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface RegistroArmazenagemCreationAttributes extends Optional<RegistroArmazenagemAttributes, 'id' | 'datecreation' | 'placa' | 'peso_bruto' | 'peso_tara' | 'desconto_umidade' | 'desconto_impureza' | 'desconto_avariados' | 'desconto_esverdeados' | 'desconto_quebra_tecnica' | 'desconto_taxa_recepcao' | 'desconto_total'> {}

/**
 * Modelo Sequelize para a entidade RegistroArmazenagem
 *
 * Registros de carga e descarga em unidades de depósito (armazenagem)
 */
class RegistroArmazenagem
  extends Model<RegistroArmazenagemAttributes, RegistroArmazenagemCreationAttributes>
  implements RegistroArmazenagemAttributes
{
  public id!: number;
  public tenantId!: number;
  public tipo!: TipoRegistroArmazenagem;
  public data!: string;
  public hora!: string | null;
  public idProduto!: number;
  public idUnidadeMedida!: number;
  public idOrigem!: number;
  public idUnidadeDeposito!: number;
  public idMotorista!: number | null;
  public ticket!: string | null;
  public placa!: string | null;
  public peso_bruto!: number | null;
  public peso_tara!: number | null;
  public peso_liquido!: number;
  public desconto_umidade!: number;
  public desconto_impureza!: number;
  public desconto_avariados!: number;
  public desconto_esverdeados!: number;
  public desconto_quebra_tecnica!: number;
  public desconto_taxa_recepcao!: number;
  public desconto_total!: number;
  public observacoes!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public produto?: Produto;
  public unidadeMedida?: UnidadeMedida;
  public origem?: ConfiguradorCiclo;
  public unidadeDeposito?: UnidadeDeposito;
  public motorista?: Pessoa;
  public usuario?: Usuario;
}

RegistroArmazenagem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do registro de armazenagem',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    tipo: {
      type: DataTypes.ENUM(...Object.values(TipoRegistroArmazenagem)),
      allowNull: false,
      comment: 'Tipo do registro: Carga ou Descarga',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do registro',
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora do registro',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idUnidadeMedida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de medida',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idOrigem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da origem (configurador de ciclo)',
      references: {
        model: 'C035_configuradorCiclo',
        key: 'id_cfg',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idUnidadeDeposito: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de depósito',
      references: {
        model: 'C052_unidadeDeposito',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idMotorista: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do motorista (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    ticket: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número do ticket',
    },
    placa: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Placa do veículo',
    },
    peso_bruto: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Peso bruto',
    },
    peso_tara: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Peso tara',
    },
    peso_liquido: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Peso líquido',
    },
    desconto_umidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por umidade',
    },
    desconto_impureza: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por impureza',
    },
    desconto_avariados: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por avariados',
    },
    desconto_esverdeados: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por esverdeados',
    },
    desconto_quebra_tecnica: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por quebra técnica',
    },
    desconto_taxa_recepcao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por taxa de recepção',
    },
    desconto_total: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto total (calculado)',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais',
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
    tableName: 'C053_registroArmazenagem',
    timestamps: false,
    underscored: false,
  }
);

// Setup associations — definidas neste arquivo (convenção master-detail)
RegistroArmazenagem.belongsTo(Produto, { foreignKey: 'idProduto', as: 'produto' });
RegistroArmazenagem.belongsTo(UnidadeMedida, { foreignKey: 'idUnidadeMedida', as: 'unidadeMedida' });
RegistroArmazenagem.belongsTo(ConfiguradorCiclo, { foreignKey: 'idOrigem', as: 'origem' });
RegistroArmazenagem.belongsTo(UnidadeDeposito, { foreignKey: 'idUnidadeDeposito', as: 'unidadeDeposito' });
RegistroArmazenagem.belongsTo(Pessoa, { foreignKey: 'idMotorista', as: 'motorista' });
RegistroArmazenagem.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuario' });

// Associação hasMany da UnidadeDeposito para RegistroArmazenagem
UnidadeDeposito.hasMany(RegistroArmazenagem, { foreignKey: 'idUnidadeDeposito', as: 'registros' });

export default RegistroArmazenagem;
