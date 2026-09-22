import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import OrdemServico from './OrdemServico';
import Talhao from './Talhao';

/**
 * Interface para atributos da entidade OrdemServicoTalhao
 */
interface OrdemServicoTalhaoAttributes {
  id: number;
  tenantId: number;
  ordemServicoId: number;
  talhaoId: number;
  areaPlanejada: number | null;
  areaReal: number | null;
  percentualArea: number | null;
  custoRateado: number | null;
  observacoes: string | null;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface OrdemServicoTalhaoCreationAttributes
  extends Optional<
    OrdemServicoTalhaoAttributes,
    'id' | 'areaPlanejada' | 'areaReal' | 'percentualArea' | 'custoRateado' | 'observacoes'
  > {}

/**
 * Modelo Sequelize para a entidade OrdemServicoTalhao
 *
 * Talhões vinculados a uma Ordem de Serviço.
 * Permite apontar qual(is) talhão(ões) serão trabalhados na OS, com controle de área.
 */
class OrdemServicoTalhao
  extends Model<OrdemServicoTalhaoAttributes, OrdemServicoTalhaoCreationAttributes>
  implements OrdemServicoTalhaoAttributes
{
  public id!: number;
  public tenantId!: number;
  public ordemServicoId!: number;
  public talhaoId!: number;
  public areaPlanejada!: number | null;
  public areaReal!: number | null;
  public percentualArea!: number | null;
  public custoRateado!: number | null;
  public observacoes!: string | null;

  // Relacionamentos
  public ordemServico?: OrdemServico;
  public talhao?: Talhao;
}

OrdemServicoTalhao.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do vínculo OS-Talhão',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o registro pertence',
      references: {
        model: 'C012_tenant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    ordemServicoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da ordem de serviço',
      references: {
        model: 'C068_ordemServico',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    talhaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do talhão',
      references: {
        model: 'C034_talhao',
        key: 'id_talhao',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    areaPlanejada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área planejada do talhão para esta OS (ha)',
    },
    areaReal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área real trabalhada no talhão (ha)',
    },
    percentualArea: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Percentual da área do talhão abrangida pela OS',
    },
    custoRateado: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Custo rateado proporcional à área deste talhão',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações específicas do talhão nesta OS',
    },
  },
  {
    sequelize,
    tableName: 'C069_ordemServicoTalhao',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['ordemServicoId'],
      },
      {
        fields: ['talhaoId'],
      },
      {
        fields: ['tenantId'],
      },
    ],
  }
);

// Associations definidas neste arquivo (padrão master-detail)
OrdemServico.hasMany(OrdemServicoTalhao, { foreignKey: 'ordemServicoId', as: 'talhoes' });
OrdemServicoTalhao.belongsTo(OrdemServico, { foreignKey: 'ordemServicoId', as: 'ordemServico' });
OrdemServicoTalhao.belongsTo(Talhao, { foreignKey: 'talhaoId', targetKey: 'id_talhao', as: 'talhao' });

export default OrdemServicoTalhao;
