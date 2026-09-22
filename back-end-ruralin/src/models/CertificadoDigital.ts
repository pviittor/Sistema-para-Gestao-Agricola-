import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';

/**
 * Enum para status do certificado digital
 */
export enum StatusCertificadoDigital {
  ATIVO = 'ativo',
  EXPIRADO = 'expirado',
  REVOGADO = 'revogado',
}

/**
 * Enum para ambiente do certificado digital
 */
export enum AmbienteCertificadoDigital {
  HOMOLOGACAO = 'homologacao',
  PRODUCAO = 'producao',
}

/**
 * Interface para atributos da entidade CertificadoDigital
 */
interface CertificadoDigitalAttributes {
  id: number;
  tenantId: number;
  nome: string;
  razao_social: string;
  cnpj_cpf: string;
  arquivo_path: string;
  senha: string;
  data_validade: Date;
  status: string;
  ambiente: string;
  uf: string;
  padrao: boolean;
  ativo: boolean;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface CertificadoDigitalCreationAttributes extends Optional<CertificadoDigitalAttributes,
  'id' | 'datecreation' | 'status' | 'ambiente' | 'padrao' | 'ativo' | 'usercreation'
> {}

/**
 * Modelo Sequelize para a entidade CertificadoDigital
 *
 * Certificados digitais para emissão de documentos fiscais eletrônicos
 */
class CertificadoDigital
  extends Model<CertificadoDigitalAttributes, CertificadoDigitalCreationAttributes>
  implements CertificadoDigitalAttributes
{
  public id!: number;
  public tenantId!: number;
  public nome!: string;
  public razao_social!: string;
  public cnpj_cpf!: string;
  public arquivo_path!: string;
  public senha!: string;
  public data_validade!: Date;
  public status!: string;
  public ambiente!: string;
  public uf!: string;
  public padrao!: boolean;
  public ativo!: boolean;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public usuarioCriador?: Usuario;
}

CertificadoDigital.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do certificado digital',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o certificado pertence',
    },
    nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome de identificação do certificado',
    },
    razao_social: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Razão social do titular do certificado',
    },
    cnpj_cpf: {
      type: DataTypes.STRING(18),
      allowNull: false,
      comment: 'CNPJ ou CPF do titular do certificado',
    },
    arquivo_path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: 'Caminho do arquivo do certificado (.pfx/.p12)',
    },
    senha: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Senha do certificado digital (criptografada)',
    },
    data_validade: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data de validade do certificado',
    },
    status: {
      type: DataTypes.ENUM('ativo', 'expirado', 'revogado'),
      allowNull: false,
      defaultValue: 'ativo',
      comment: 'Status do certificado digital',
    },
    ambiente: {
      type: DataTypes.ENUM('homologacao', 'producao'),
      allowNull: false,
      defaultValue: 'homologacao',
      comment: 'Ambiente de utilização (homologação ou produção)',
    },
    uf: {
      type: DataTypes.STRING(2),
      allowNull: false,
      comment: 'Unidade federativa do certificado',
    },
    padrao: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se é o certificado padrão do tenant',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro está ativo',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'C052_certificadoDigital',
    timestamps: false,
    underscored: false,
  }
);

// Setup associations
CertificadoDigital.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default CertificadoDigital;
