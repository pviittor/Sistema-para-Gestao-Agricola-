import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { FuncaoResponsavelOS } from './enums/OrdemServicoEnums';
import OrdemServico from './OrdemServico';
import Pessoa from './Pessoa';

/**
 * Interface para atributos da entidade OrdemServicoResponsavel
 */
interface OrdemServicoResponsavelAttributes {
  id: number;
  tenantId: number;
  ordemServicoId: number;
  pessoaId: number;
  funcao: FuncaoResponsavelOS;
  horasPlanejadas: number | null;
  custoHoraPlanejado: number | null;
  horasReais: number | null;
  custoHoraReal: number | null;
  observacoes: string | null;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface OrdemServicoResponsavelCreationAttributes
  extends Optional<
    OrdemServicoResponsavelAttributes,
    | 'id'
    | 'horasPlanejadas'
    | 'custoHoraPlanejado'
    | 'horasReais'
    | 'custoHoraReal'
    | 'observacoes'
  > {}

/**
 * Modelo Sequelize para a entidade OrdemServicoResponsavel
 *
 * Pessoas responsáveis pela execução de uma Ordem de Serviço.
 * Permite vincular múltiplos responsáveis com funções distintas (RESPONSAVEL, OPERADOR, FISCAL, AUXILIAR).
 */
class OrdemServicoResponsavel
  extends Model<OrdemServicoResponsavelAttributes, OrdemServicoResponsavelCreationAttributes>
  implements OrdemServicoResponsavelAttributes
{
  public id!: number;
  public tenantId!: number;
  public ordemServicoId!: number;
  public pessoaId!: number;
  public funcao!: FuncaoResponsavelOS;
  public horasPlanejadas!: number | null;
  public custoHoraPlanejado!: number | null;
  public horasReais!: number | null;
  public custoHoraReal!: number | null;
  public observacoes!: string | null;

  // Relacionamentos
  public ordemServico?: OrdemServico;
  public pessoa?: Pessoa;
}

OrdemServicoResponsavel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do vínculo OS-Responsável',
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
    pessoaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa responsável',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    funcao: {
      type: DataTypes.ENUM(...Object.values(FuncaoResponsavelOS)),
      allowNull: false,
      comment: 'Função do responsável na OS (RESPONSAVEL, OPERADOR, FISCAL, AUXILIAR)',
    },
    horasPlanejadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Horas planejadas de trabalho do responsável',
    },
    custoHoraPlanejado: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      comment: 'Custo por hora planejado do responsável',
    },
    horasReais: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Horas reais trabalhadas pelo responsável',
    },
    custoHoraReal: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      comment: 'Custo por hora real do responsável',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre a participação do responsável',
    },
  },
  {
    sequelize,
    tableName: 'C072_ordemServicoResponsavel',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['ordemServicoId'],
      },
      {
        fields: ['pessoaId'],
      },
      {
        fields: ['tenantId'],
      },
    ],
  }
);

// Associations definidas neste arquivo (padrão master-detail)
OrdemServico.hasMany(OrdemServicoResponsavel, { foreignKey: 'ordemServicoId', as: 'responsaveis' });
OrdemServicoResponsavel.belongsTo(OrdemServico, { foreignKey: 'ordemServicoId', as: 'ordemServico' });
OrdemServicoResponsavel.belongsTo(Pessoa, { foreignKey: 'pessoaId', targetKey: 'id_pessoa', as: 'pessoa' });

export default OrdemServicoResponsavel;
