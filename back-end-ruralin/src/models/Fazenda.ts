import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import Pessoa from './Pessoa';
import Municipio from './Municipio';

/**
 * Interface para atributos da entidade Fazenda
 */
interface FazendaAttributes {
  id: number;
  tenantId: number;
  idPessoa: number;
  descricao: string;
  endereco?: string | null;
  complemento?: string | null;
  idMunicipio: number;
  inscricaoEstadual?: string | null;
  areaTotal: number;
  areaCultivada: number;
  reservaLegal: number;
  telefone?: string | null;
  gerente?: string | null;
  matricula?: string | null;
  livro?: string | null;
  folha?: string | null;
  itr?: string | null;
  cei?: string | null;
  lcdprTipoExploracao?: number | null;
  lcdprParticipacao: number;
  arrendada: boolean;
  idPessoaArrendamento?: number | null;
  documento?: string | null;
  dataInicio?: Date | null;
  dataFim?: Date | null;
  observacoes?: string | null;
  movimentaLCDPR: boolean;
  movimentaGado: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface FazendaCreationAttributes extends Optional<FazendaAttributes, 'id' | 'datecreation' | 'lcdprParticipacao' | 'arrendada' | 'movimentaLCDPR' | 'movimentaGado'> {}

/**
 * Modelo Sequelize para a entidade Fazenda
 * 
 * Fazendas agrícolas vinculadas a produtores
 */
class Fazenda
  extends Model<FazendaAttributes, FazendaCreationAttributes>
  implements FazendaAttributes
{
  public id!: number;
  public tenantId!: number;
  public idPessoa!: number;
  public descricao!: string;
  public endereco!: string | null;
  public complemento!: string | null;
  public idMunicipio!: number;
  public inscricaoEstadual!: string | null;
  public areaTotal!: number;
  public areaCultivada!: number;
  public reservaLegal!: number;
  public telefone!: string | null;
  public gerente!: string | null;
  public matricula!: string | null;
  public livro!: string | null;
  public folha!: string | null;
  public itr!: string | null;
  public cei!: string | null;
  public lcdprTipoExploracao!: number | null;
  public lcdprParticipacao!: number;
  public arrendada!: boolean;
  public idPessoaArrendamento!: number | null;
  public documento!: string | null;
  public dataInicio!: Date | null;
  public dataFim!: Date | null;
  public observacoes!: string | null;
  public movimentaLCDPR!: boolean;
  public movimentaGado!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public pessoa?: Pessoa;
  public municipio?: Municipio;
  public pessoaArrendamento?: Pessoa;
  public usuarioCriador?: Usuario;
}

Fazenda.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da fazenda',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a fazenda pertence',
    },
    idPessoa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa (produtor) proprietária da fazenda',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição/nome da fazenda',
    },
    endereco: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Endereço da fazenda',
    },
    complemento: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Complemento do endereço',
    },
    idMunicipio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do município onde a fazenda está localizada',
      references: {
        model: 'C015_municipio',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    inscricaoEstadual: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Inscrição estadual da fazenda',
    },
    areaTotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Área total da fazenda em hectares',
    },
    areaCultivada: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Área cultivada em hectares',
    },
    reservaLegal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Reserva legal em hectares',
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Telefone de contato da fazenda',
    },
    gerente: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nome do gerente da fazenda',
    },
    matricula: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Matrícula do imóvel',
    },
    livro: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Livro da matrícula',
    },
    folha: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Folha da matrícula',
    },
    itr: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'ITR (Imposto Territorial Rural)',
    },
    cei: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'CEI (Cadastro Específico do INSS)',
    },
    lcdprTipoExploracao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tipo de exploração LCDPR (1-Exploração individual, 2-Condomínio, 3-Imóvel arrendado, 4-Parceria, 5-Comodato)',
    },
    lcdprParticipacao: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Participação na exploração (percentual)',
    },
    arrendada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se a fazenda é arrendada',
    },
    idPessoaArrendamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da pessoa (arrendador) quando a fazenda é arrendada',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    documento: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Documento do arrendamento',
    },
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de início do arrendamento',
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de fim do arrendamento',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais sobre a fazenda',
    },
    movimentaLCDPR: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se a fazenda movimenta LCDPR',
    },
    movimentaGado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se a fazenda movimenta gado',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuário que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
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
    tableName: 'C018_fazenda',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idPessoa'],
      },
      {
        fields: ['idMunicipio'],
      },
      {
        fields: ['idPessoaArrendamento'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Fazenda.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
Fazenda.belongsTo(Pessoa, { foreignKey: 'idPessoa', as: 'pessoa' });
Fazenda.belongsTo(Municipio, { foreignKey: 'idMunicipio', as: 'municipio' });
Fazenda.belongsTo(Pessoa, { foreignKey: 'idPessoaArrendamento', as: 'pessoaArrendamento' });

export default Fazenda;
