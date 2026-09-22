import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import Usuario from "./Usuario";

/**
 * Interface para atributos da entidade Pessoa
 */
interface PessoaAttributes {
  id_pessoa: number;
  tenantId: number;
  nomerazao_pessoa?: string | null;
  nomefantasia_pessoa?: string | null;
  cpfcnpj_pessoa?: string | null;
  nascimento_pessoa?: Date | null;
  contato_pessoa?: string | null;
  email_pessoa?: string | null;
  identidade_pessoa?: string | null;
  orgaoidentidade_pessoa?: string | null;
  caixapostal_pessoa?: string | null;
  cep_pessoa?: string | null;
  complemento_pessoa?: string | null;
  certidaonegativa_pessoa?: string | null;
  codigoautorizacao_pessoa?: string | null;
  cliente_pessoa: boolean;
  produtor_pessoa: boolean;
  portador_pessoa: boolean;
  funcionario_pessoa: boolean;
  fornecedor_pessoa: boolean;
  motorista_pessoa: boolean;
  operador_pessoa: boolean;
  usercreation: number;
  datecreation: Date;
  idMunicipio?: number | null;
  tipo_pessoa: number; // PF = PESSOA FISICA | PJ = PESSOA JURIDICA
  endereco_pessoa?: string | null;
  bairro_pessoa?: string | null;
  numero_pessoa?: string | null;
  telefone1_pessoa?: string | null;
  inscricaoEstadual_pessoa?: string | null;
  observacao_pessoa?: string | null;
  inscricaoMunicipal_pessoa?: string | null;
}

/**
 * Interface para atributos de criação (id_pessoa é opcional pois é auto-increment)
 */
interface PessoaCreationAttributes extends Optional<PessoaAttributes, "id_pessoa"> {}

/**
 * Modelo Sequelize para a entidade Pessoa
 * 
 * Representa pessoas físicas e jurídicas do sistema, podendo ter múltiplos
 * papéis: cliente, produtor, portador, funcionário, fornecedor, motorista, operador.
 */
class Pessoa
  extends Model<PessoaAttributes, PessoaCreationAttributes>
  implements PessoaAttributes
{
  public id_pessoa!: number;
  public tenantId!: number;
  public nomerazao_pessoa!: string | null;
  public nomefantasia_pessoa!: string | null;
  public cpfcnpj_pessoa!: string | null;
  public nascimento_pessoa!: Date | null;
  public contato_pessoa!: string | null;
  public email_pessoa!: string | null;
  public identidade_pessoa!: string | null;
  public orgaoidentidade_pessoa!: string | null;
  public caixapostal_pessoa!: string | null;
  public cep_pessoa!: string | null;
  public complemento_pessoa!: string | null;
  public certidaonegativa_pessoa!: string | null;
  public codigoautorizacao_pessoa!: string | null;
  public cliente_pessoa!: boolean;
  public produtor_pessoa!: boolean;
  public portador_pessoa!: boolean;
  public funcionario_pessoa!: boolean;
  public fornecedor_pessoa!: boolean;
  public motorista_pessoa!: boolean;
  public operador_pessoa!: boolean;
  public usercreation!: number;
  public datecreation!: Date;
  public idMunicipio!: number | null;
  public tipo_pessoa!: number;
  public endereco_pessoa!: string | null;
  public bairro_pessoa!: string | null;
  public numero_pessoa!: string | null;
  public telefone1_pessoa!: string | null;
  public inscricaoEstadual_pessoa!: string | null;
  public observacao_pessoa!: string | null;
  public inscricaoMunicipal_pessoa!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pessoa.init(
  {
    id_pessoa: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: "ID único da pessoa (auto-increment)",
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Será populado na migração de dados, depois será NOT NULL
      comment: "ID do tenant ao qual a pessoa pertence",
    },
    nomerazao_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Nome (pessoa física) ou razão social (pessoa jurídica)",
    },
    nomefantasia_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Nome fantasia (principalmente para pessoa jurídica)",
    },
    cpfcnpj_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "CPF (pessoa física) ou CNPJ (pessoa jurídica)",
    },
    nascimento_pessoa: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Data de nascimento (pessoa física) ou fundação (pessoa jurídica)",
    },
    contato_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Nome do contato da pessoa",
    },
    email_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Email de contato da pessoa",
    },
    identidade_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Número da identidade (RG)",
    },
    orgaoidentidade_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Órgão emissor da identidade",
    },
    caixapostal_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Caixa postal",
    },
    cep_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "CEP do endereço",
    },
    complemento_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Complemento do endereço",
    },
    certidaonegativa_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Certidão negativa",
    },
    codigoautorizacao_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Código de autorização",
    },
    cliente_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é cliente",
    },
    produtor_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é produtor",
    },
    portador_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é portador",
    },
    funcionario_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é funcionário",
    },
    fornecedor_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é fornecedor",
    },
    motorista_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é motorista",
    },
    operador_pessoa: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Indica se a pessoa é operador",
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: "id",
      },
      onDelete: "RESTRICT",
      comment: "ID do usuário que criou o registro",
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "Data de criação do registro",
    },
    idMunicipio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID do município (relacionamento será adicionado quando modelo Municipio existir)",
    },
    tipo_pessoa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)",
    },
    endereco_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Endereço completo da pessoa",
    },
    bairro_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Bairro do endereço",
    },
    numero_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Número do endereço",
    },
    telefone1_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Telefone principal de contato",
    },
    inscricaoEstadual_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Inscrição estadual (pessoa jurídica)",
    },
    observacao_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Observações gerais sobre a pessoa",
    },
    inscricaoMunicipal_pessoa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Inscrição municipal (pessoa jurídica)",
    },
  },
  {
    sequelize,
    tableName: "C001_PESSOA",
    timestamps: false, // Desabilitado pois a tabela usa datecreation ao invés de createdAt/updatedAt
    underscored: false, // Mantém os nomes dos campos como estão
  }
);

// Setup association
Pessoa.belongsTo(Usuario, { foreignKey: "usercreation", as: "usuarioCriador" });

export default Pessoa;
