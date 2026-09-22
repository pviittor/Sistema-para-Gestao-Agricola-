import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Fazenda from './Fazenda';
import UnidadeMedida from './UnidadeMedida';
import Safra from './Safra';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade Benfeitoria
 */
interface BenfeitoriaAttributes {
  id_benf: number;
  tenantId: number;
  descricao: string;
  valortotal: number;
  vidautil: number;
  percsucata: number;
  depreciacaoano: number;
  taxamanutencao: number;
  manutencaoano: number;
  idFazenda: number;
  idUnidadeMedida?: number | null;
  idSafra?: number | null;
  data?: string | null;
  observacao?: string | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_benf é opcional pois é auto-increment)
 */
interface BenfeitoriaCreationAttributes extends Optional<BenfeitoriaAttributes, 'id_benf' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Benfeitoria
 *
 * Registro de benfeitorias em fazendas (patrimônio)
 */
class Benfeitoria
  extends Model<BenfeitoriaAttributes, BenfeitoriaCreationAttributes>
  implements BenfeitoriaAttributes
{
  public id_benf!: number;
  public tenantId!: number;
  public descricao!: string;
  public valortotal!: number;
  public vidautil!: number;
  public percsucata!: number;
  public depreciacaoano!: number;
  public taxamanutencao!: number;
  public manutencaoano!: number;
  public idFazenda!: number;
  public idUnidadeMedida!: number | null;
  public idSafra!: number | null;
  public data!: string | null;
  public observacao!: string | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public fazenda?: Fazenda;
  public unidadeMedida?: UnidadeMedida;
  public safra?: Safra;
  public usuarioCriador?: Usuario;
}

Benfeitoria.init(
  {
    id_benf: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da benfeitoria',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    descricao: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição da benfeitoria',
    },
    valortotal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor total da benfeitoria',
    },
    vidautil: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Vida útil em anos',
    },
    percsucata: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Percentual de sucata',
    },
    depreciacaoano: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Depreciação anual',
    },
    taxamanutencao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Taxa de manutenção',
    },
    manutencaoano: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Manutenção anual',
    },
    idFazenda: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da fazenda',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idUnidadeMedida: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da unidade de medida',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idSafra: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da safra',
      references: {
        model: 'C017_safra',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data da benfeitoria',
    },
    observacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações adicionais',
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
    tableName: 'C042_benfeitoria',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['idFazenda'],
      },
      {
        fields: ['idSafra'],
      },
    ],
  }
);

// Setup associations
Benfeitoria.belongsTo(Fazenda, { foreignKey: 'idFazenda', as: 'fazenda' });
Benfeitoria.belongsTo(UnidadeMedida, { foreignKey: 'idUnidadeMedida', as: 'unidadeMedida' });
Benfeitoria.belongsTo(Safra, { foreignKey: 'idSafra', as: 'safra' });
Benfeitoria.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default Benfeitoria;
