import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { CategoriaAtividadeOS } from './enums/OrdemServicoEnums';

/**
 * Interface para atributos da entidade TipoAtividadeOS
 */
interface TipoAtividadeOSAttributes {
  id: number;
  tenantId: number;
  nome: string;
  descricao: string | null;
  categoria: CategoriaAtividadeOS;
  icone: string | null;
  cor: string | null;
  ativo: boolean;
  planoContaIdPadrao: number | null;
  centroCustoIdPadrao: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface TipoAtividadeOSCreationAttributes
  extends Optional<TipoAtividadeOSAttributes, 'id' | 'descricao' | 'icone' | 'cor' | 'ativo' | 'planoContaIdPadrao' | 'centroCustoIdPadrao' | 'createdAt' | 'updatedAt'> {}

/**
 * Modelo Sequelize para a entidade TipoAtividadeOS
 *
 * Tipos de atividades para Ordens de Serviço (ex: Plantio, Colheita, Manutenção)
 */
class TipoAtividadeOS
  extends Model<TipoAtividadeOSAttributes, TipoAtividadeOSCreationAttributes>
  implements TipoAtividadeOSAttributes
{
  public id!: number;
  public tenantId!: number;
  public nome!: string;
  public descricao!: string | null;
  public categoria!: CategoriaAtividadeOS;
  public icone!: string | null;
  public cor!: string | null;
  public ativo!: boolean;
  public planoContaIdPadrao!: number | null;
  public centroCustoIdPadrao!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos (associations definidas nos arquivos dos filhos)
  public camposCondicionais?: any[];
}

TipoAtividadeOS.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do tipo de atividade OS',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o tipo de atividade pertence',
      references: {
        model: 'C012_tenant',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nome do tipo de atividade',
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descrição detalhada do tipo de atividade',
    },
    categoria: {
      type: DataTypes.ENUM(...Object.values(CategoriaAtividadeOS)),
      allowNull: false,
      comment: 'Categoria da atividade (AGRICOLA, PECUARIA, ADMINISTRATIVA, MANUTENCAO)',
    },
    icone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Ícone representativo da atividade',
    },
    cor: {
      type: DataTypes.STRING(7),
      allowNull: true,
      comment: 'Cor em hexadecimal para identificação visual (#RRGGBB)',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica se o tipo de atividade está ativo',
    },
    planoContaIdPadrao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Plano de conta gerencial padrão para custeio',
      references: {
        model: 'C009_planoContaGerencial',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    centroCustoIdPadrao: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Centro de custo padrão para custeio',
      references: {
        model: 'C010_centroCusto',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    tableName: 'C066_tipoAtividadeOS',
    timestamps: true,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['tenantId', 'categoria'],
      },
      {
        fields: ['tenantId', 'ativo'],
      },
    ],
  }
);

export default TipoAtividadeOS;
