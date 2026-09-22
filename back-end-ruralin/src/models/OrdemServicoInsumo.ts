import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import OrdemServico from './OrdemServico';
import Produto from './Produto';
import UnidadeMedida from './UnidadeMedida';

/**
 * Interface para atributos da entidade OrdemServicoInsumo
 */
interface OrdemServicoInsumoAttributes {
  id: number;
  tenantId: number;
  ordemServicoId: number;
  produtoId: number;
  unidadeMedidaId: number;
  quantidadePlanejada: number | null;
  custoUnitarioPlanejado: number | null;
  quantidadeReal: number | null;
  custoUnitarioReal: number | null;
  dosagem: number | null;
  areaAplicada: number | null;
  movimentoEstoqueId: number | null;
  observacoes: string | null;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface OrdemServicoInsumoCreationAttributes
  extends Optional<
    OrdemServicoInsumoAttributes,
    | 'id'
    | 'quantidadePlanejada'
    | 'custoUnitarioPlanejado'
    | 'quantidadeReal'
    | 'custoUnitarioReal'
    | 'dosagem'
    | 'areaAplicada'
    | 'movimentoEstoqueId'
    | 'observacoes'
  > {}

/**
 * Modelo Sequelize para a entidade OrdemServicoInsumo
 *
 * Insumos (produtos) planejados e utilizados em uma Ordem de Serviço.
 * Controla quantidade, custo e vinculação com movimentos de estoque.
 */
class OrdemServicoInsumo
  extends Model<OrdemServicoInsumoAttributes, OrdemServicoInsumoCreationAttributes>
  implements OrdemServicoInsumoAttributes
{
  public id!: number;
  public tenantId!: number;
  public ordemServicoId!: number;
  public produtoId!: number;
  public unidadeMedidaId!: number;
  public quantidadePlanejada!: number | null;
  public custoUnitarioPlanejado!: number | null;
  public quantidadeReal!: number | null;
  public custoUnitarioReal!: number | null;
  public dosagem!: number | null;
  public areaAplicada!: number | null;
  public movimentoEstoqueId!: number | null;
  public observacoes!: string | null;

  // Relacionamentos
  public ordemServico?: OrdemServico;
  public produto?: Produto;
  public unidadeMedida?: UnidadeMedida;
}

OrdemServicoInsumo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do insumo da OS',
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
    produtoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto/insumo utilizado',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    unidadeMedidaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de medida do insumo',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    quantidadePlanejada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Quantidade planejada do insumo',
    },
    custoUnitarioPlanejado: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      comment: 'Custo unitário planejado do insumo',
    },
    quantidadeReal: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Quantidade real utilizada do insumo',
    },
    custoUnitarioReal: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      comment: 'Custo unitário real do insumo',
    },
    dosagem: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Dosagem do insumo por unidade de área (ex: L/ha, kg/ha)',
    },
    areaAplicada: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: true,
      comment: 'Área em que o insumo foi aplicado (ha)',
    },
    movimentoEstoqueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do movimento de estoque gerado ao processar a OS',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o uso do insumo',
    },
  },
  {
    sequelize,
    tableName: 'C070_ordemServicoInsumo',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['ordemServicoId'],
      },
      {
        fields: ['produtoId'],
      },
      {
        fields: ['tenantId'],
      },
    ],
  }
);

// Associations definidas neste arquivo (padrão master-detail)
OrdemServico.hasMany(OrdemServicoInsumo, { foreignKey: 'ordemServicoId', as: 'insumos' });
OrdemServicoInsumo.belongsTo(OrdemServico, { foreignKey: 'ordemServicoId', as: 'ordemServico' });
OrdemServicoInsumo.belongsTo(Produto, { foreignKey: 'produtoId', targetKey: 'id_prod', as: 'produto' });
OrdemServicoInsumo.belongsTo(UnidadeMedida, { foreignKey: 'unidadeMedidaId', targetKey: 'id_unidade', as: 'unidadeMedida' });

export default OrdemServicoInsumo;
