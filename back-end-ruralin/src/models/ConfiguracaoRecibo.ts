import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ConfiguracaoReciboAttributes {
  id: number;
  tenantId: number;
  nomePropriedade: string;
  cnpjCpf: string | null;
  inscricaoEstadual: string | null;
  endereco: string | null;
  telefone: string | null;
  logoBase64: string | null;
  observacaoPadrao: string | null;
  localPadrao: string | null;
  ativo: boolean;
}

interface ConfiguracaoReciboCreationAttributes extends Optional<ConfiguracaoReciboAttributes,
  'id' | 'cnpjCpf' | 'inscricaoEstadual' | 'endereco' | 'telefone' | 'logoBase64' | 'observacaoPadrao' | 'localPadrao' | 'ativo'
> {}

class ConfiguracaoRecibo extends Model<ConfiguracaoReciboAttributes, ConfiguracaoReciboCreationAttributes>
  implements ConfiguracaoReciboAttributes
{
  public id!: number;
  public tenantId!: number;
  public nomePropriedade!: string;
  public cnpjCpf!: string | null;
  public inscricaoEstadual!: string | null;
  public endereco!: string | null;
  public telefone!: string | null;
  public logoBase64!: string | null;
  public observacaoPadrao!: string | null;
  public localPadrao!: string | null;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ConfiguracaoRecibo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da configuração de recibo',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant',
    },
    nomePropriedade: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome da propriedade/empresa emissora',
    },
    cnpjCpf: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'CNPJ ou CPF do emitente',
    },
    inscricaoEstadual: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Inscrição estadual do emitente',
    },
    endereco: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Endereço completo do emitente',
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Telefone do emitente',
    },
    logoBase64: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      comment: 'Logo em formato Base64 para impressão no recibo',
    },
    observacaoPadrao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observação padrão para novos recibos',
    },
    localPadrao: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Local padrão de emissão do recibo',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se a configuração está ativa',
    },
  },
  {
    sequelize,
    tableName: 'C064_configuracaoRecibo',
    timestamps: true,
    underscored: false,
  }
);

export default ConfiguracaoRecibo;
