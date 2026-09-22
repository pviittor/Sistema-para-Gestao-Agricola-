import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import GrupoEquipamento from './GrupoEquipamento';
import Pessoa from './Pessoa';
import Produto from './Produto';
import Fazenda from './Fazenda';

/**
 * Interface para atributos da entidade Maquina
 */
interface MaquinaAttributes {
  id_mqn: number;
  tenantId: number;
  descricao: string;
  chassi?: string | null;
  placa?: string | null;
  ano?: number | null;
  modelo?: string | null;
  serie?: string | null;
  marca?: string | null;
  idGrupoEquipamento?: number | null;
  tipoMarcador?: number | null;
  combustivel?: number | null;
  tipo?: number | null;
  dataAquisicao?: Date | null;
  valorAquisicao?: number | null;
  valorAtual?: number | null;
  idFornecedor?: number | null;
  notaFiscal?: string | null;
  serieNotaFiscal?: string | null;
  dataNotaFiscal?: Date | null;
  vidaUtil?: number | null;
  percsucata?: number | null;
  depreciacaoAnual?: number | null;
  horaUtilAno?: number | null;
  horimetroInicial?: number | null;
  ultimoHorimetro?: number | null;
  horimetroAbastecimento?: number | null;
  horimetroManutencao?: number | null;
  horimetroApontamento?: number | null;
  custoFixo?: boolean | null;
  valorCustoFixo?: number | null;
  valorConsumoFixo?: number | null;
  custoDepreciacao?: boolean | null;
  valorHoraDepreciacao?: number | null;
  custoManutencao?: boolean | null;
  custoCombustivel?: boolean | null;
  valorHora?: number | null;
  consumoEstimadoCombustivel?: number | null;
  idCombustivelMaquina?: number | null;
  idFazenda?: number | null;
  idMotorista?: number | null;
  consumoHA?: number | null;
  custoHA?: number | null;
  tara?: number | null;
  utilizarTaraPesagem?: boolean | null;
  idSeguradora?: number | null;
  inicioSeguro?: Date | null;
  fimSeguro?: Date | null;
  aplice?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_mqn é opcional pois é auto-increment)
 */
interface MaquinaCreationAttributes extends Optional<MaquinaAttributes, 'id_mqn' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Maquina
 *
 * Máquinas, veículos e implementos agrícolas
 */
class Maquina
  extends Model<MaquinaAttributes, MaquinaCreationAttributes>
  implements MaquinaAttributes
{
  public id_mqn!: number;
  public tenantId!: number;
  public descricao!: string;
  public chassi!: string | null;
  public placa!: string | null;
  public ano!: number | null;
  public modelo!: string | null;
  public serie!: string | null;
  public marca!: string | null;
  public idGrupoEquipamento!: number | null;
  public tipoMarcador!: number | null;
  public combustivel!: number | null;
  public tipo!: number | null;
  public dataAquisicao!: Date | null;
  public valorAquisicao!: number | null;
  public valorAtual!: number | null;
  public idFornecedor!: number | null;
  public notaFiscal!: string | null;
  public serieNotaFiscal!: string | null;
  public dataNotaFiscal!: Date | null;
  public vidaUtil!: number | null;
  public percsucata!: number | null;
  public depreciacaoAnual!: number | null;
  public horaUtilAno!: number | null;
  public horimetroInicial!: number | null;
  public ultimoHorimetro!: number | null;
  public horimetroAbastecimento!: number | null;
  public horimetroManutencao!: number | null;
  public horimetroApontamento!: number | null;
  public custoFixo!: boolean | null;
  public valorCustoFixo!: number | null;
  public valorConsumoFixo!: number | null;
  public custoDepreciacao!: boolean | null;
  public valorHoraDepreciacao!: number | null;
  public custoManutencao!: boolean | null;
  public custoCombustivel!: boolean | null;
  public valorHora!: number | null;
  public consumoEstimadoCombustivel!: number | null;
  public idCombustivelMaquina!: number | null;
  public idFazenda!: number | null;
  public idMotorista!: number | null;
  public consumoHA!: number | null;
  public custoHA!: number | null;
  public tara!: number | null;
  public utilizarTaraPesagem!: boolean | null;
  public idSeguradora!: number | null;
  public inicioSeguro!: Date | null;
  public fimSeguro!: Date | null;
  public aplice!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public grupoEquipamento?: GrupoEquipamento;
  public fornecedor?: Pessoa;
  public motorista?: Pessoa;
  public seguradora?: Pessoa;
  public combustivelMaquina?: Produto;
  public fazenda?: Fazenda;
  public usuarioCriador?: Usuario;
}

Maquina.init(
  {
    id_mqn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da máquina',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a máquina pertence',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição/nome da máquina',
    },
    chassi: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número do chassi',
    },
    placa: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Placa do veículo',
    },
    ano: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ano de fabricação',
    },
    modelo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Modelo da máquina',
    },
    serie: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número de série',
    },
    marca: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Marca da máquina',
    },
    idGrupoEquipamento: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do grupo de equipamento',
      references: {
        model: 'C029_grupoEquipamento',
        key: 'id_grpequip',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    tipoMarcador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tipo de marcador (1-Horímetro, 2-Odômetro, 3-Nenhum)',
    },
    combustivel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tipo de combustível (1-Gasolina, 2-Diesel, 3-Etanol, 4-Gás, 5-Elétrico, 6-Híbrido)',
    },
    tipo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tipo da máquina (1-Máquina, 2-Veículo, 3-Implemento)',
    },
    dataAquisicao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de aquisição',
    },
    valorAquisicao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor de aquisição',
    },
    valorAtual: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor atual da máquina',
    },
    idFornecedor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do fornecedor (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    notaFiscal: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Número da nota fiscal',
    },
    serieNotaFiscal: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Série da nota fiscal',
    },
    dataNotaFiscal: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data da nota fiscal',
    },
    vidaUtil: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Vida útil em anos',
    },
    percsucata: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Percentual de sucata',
    },
    depreciacaoAnual: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor de depreciação anual',
    },
    horaUtilAno: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Horas úteis por ano',
    },
    horimetroInicial: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Horímetro inicial',
    },
    ultimoHorimetro: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Último horímetro registrado',
    },
    horimetroAbastecimento: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Horímetro de abastecimento',
    },
    horimetroManutencao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Horímetro de manutenção',
    },
    horimetroApontamento: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Horímetro de apontamento',
    },
    custoFixo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Se utiliza custo fixo',
    },
    valorCustoFixo: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor do custo fixo',
    },
    valorConsumoFixo: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor do consumo fixo',
    },
    custoDepreciacao: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Se utiliza custo de depreciação',
    },
    valorHoraDepreciacao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor hora de depreciação',
    },
    custoManutencao: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Se utiliza custo de manutenção',
    },
    custoCombustivel: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Se utiliza custo de combustível',
    },
    valorHora: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Valor da hora da máquina',
    },
    consumoEstimadoCombustivel: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Consumo estimado de combustível',
    },
    idCombustivelMaquina: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do produto combustível',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idFazenda: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da fazenda',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    consumoHA: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Consumo por hectare',
    },
    custoHA: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Custo por hectare',
    },
    tara: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Tara da máquina (peso)',
    },
    utilizarTaraPesagem: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Se utiliza tara na pesagem',
    },
    idSeguradora: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da seguradora (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    inicioSeguro: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de início do seguro',
    },
    fimSeguro: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de fim do seguro',
    },
    aplice: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número da apólice de seguro',
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
    tableName: 'C030_maquina',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idGrupoEquipamento'],
      },
      {
        fields: ['idFornecedor'],
      },
      {
        fields: ['idMotorista'],
      },
      {
        fields: ['idFazenda'],
      },
      {
        fields: ['placa'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
Maquina.belongsTo(GrupoEquipamento, { foreignKey: 'idGrupoEquipamento', as: 'grupoEquipamento' });
Maquina.belongsTo(Pessoa, { foreignKey: 'idFornecedor', as: 'fornecedor' });
Maquina.belongsTo(Pessoa, { foreignKey: 'idMotorista', as: 'motorista' });
Maquina.belongsTo(Pessoa, { foreignKey: 'idSeguradora', as: 'seguradora' });
Maquina.belongsTo(Produto, { foreignKey: 'idCombustivelMaquina', as: 'combustivelMaquina' });
Maquina.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
Maquina.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Maquina;
