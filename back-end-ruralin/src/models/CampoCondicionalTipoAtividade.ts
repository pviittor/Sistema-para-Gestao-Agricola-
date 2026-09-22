import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { TipoCampoCondicional } from './enums/OrdemServicoEnums';
import TipoAtividadeOS from './TipoAtividadeOS';

/**
 * Interface para atributos da entidade CampoCondicionalTipoAtividade
 */
interface CampoCondicionalTipoAtividadeAttributes {
  id: number;
  tenantId: number;
  tipoAtividadeOSId: number;
  nomeCampo: string;
  rotulo: string;
  tipoCampo: TipoCampoCondicional;
  obrigatorio: boolean;
  opcoes: Record<string, any> | null;
  unidade: string | null;
  ordem: number | null;
  ativo: boolean;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface CampoCondicionalTipoAtividadeCreationAttributes
  extends Optional<
    CampoCondicionalTipoAtividadeAttributes,
    'id' | 'obrigatorio' | 'opcoes' | 'unidade' | 'ordem' | 'ativo'
  > {}

/**
 * Modelo Sequelize para a entidade CampoCondicionalTipoAtividade
 *
 * Campos dinâmicos condicionais associados a um tipo de atividade OS.
 * Permite configurar campos extras específicos por tipo de atividade.
 */
class CampoCondicionalTipoAtividade
  extends Model<CampoCondicionalTipoAtividadeAttributes, CampoCondicionalTipoAtividadeCreationAttributes>
  implements CampoCondicionalTipoAtividadeAttributes
{
  public id!: number;
  public tenantId!: number;
  public tipoAtividadeOSId!: number;
  public nomeCampo!: string;
  public rotulo!: string;
  public tipoCampo!: TipoCampoCondicional;
  public obrigatorio!: boolean;
  public opcoes!: Record<string, any> | null;
  public unidade!: string | null;
  public ordem!: number | null;
  public ativo!: boolean;

  // Relacionamentos
  public tipoAtividade?: TipoAtividadeOS;
}

CampoCondicionalTipoAtividade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do campo condicional',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o campo pertence',
      references: {
        model: 'C012_tenant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    tipoAtividadeOSId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tipo de atividade OS ao qual o campo pertence',
      references: {
        model: 'C066_tipoAtividadeOS',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    nomeCampo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome interno do campo (chave no JSON de camposCondicionais)',
    },
    rotulo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Rótulo exibido ao usuário no formulário',
    },
    tipoCampo: {
      type: DataTypes.ENUM(...Object.values(TipoCampoCondicional)),
      allowNull: false,
      comment: 'Tipo do campo (TEXT, NUMBER, DATE, BOOLEAN, SELECT)',
    },
    obrigatorio: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o campo é obrigatório',
    },
    opcoes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Opções disponíveis para campos do tipo SELECT',
    },
    unidade: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Unidade de medida para campos numéricos (ex: kg, L, ha)',
    },
    ordem: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Ordem de exibição do campo no formulário',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se o campo está ativo',
    },
  },
  {
    sequelize,
    tableName: 'C067_campoCondicionalTipoAtividade',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['tipoAtividadeOSId'],
      },
      {
        fields: ['tipoAtividadeOSId', 'ordem'],
      },
    ],
  }
);

// Associations definidas neste arquivo (padrão master-detail)
TipoAtividadeOS.hasMany(CampoCondicionalTipoAtividade, {
  foreignKey: 'tipoAtividadeOSId',
  as: 'camposCondicionais',
});
CampoCondicionalTipoAtividade.belongsTo(TipoAtividadeOS, {
  foreignKey: 'tipoAtividadeOSId',
  as: 'tipoAtividade',
});

export default CampoCondicionalTipoAtividade;
