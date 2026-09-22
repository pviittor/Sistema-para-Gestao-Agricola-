import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import PlanoContaGerencial from './PlanoContaGerencial';
import ConfiguradorCiclo from './ConfiguradorCiclo';
import Usuario from './Usuario';

/**
 * Interface para atributos da entidade OutraDespesaReceita
 */
interface OutraDespesaReceitaAttributes {
  id: number;
  tenantId: number;
  planoGerencialId: number;
  dataMovimento: string;
  valor: number;
  observacoes?: string | null;
  tipo: 'RECEITA' | 'DESPESA';
  tipoAlocacao: 'PROPRIEDADE' | 'CONFIGURADOR_CICLO';
  configuradorCicloId?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface OutraDespesaReceitaCreationAttributes extends Optional<OutraDespesaReceitaAttributes, 'id' | 'datecreation' | 'observacoes' | 'configuradorCicloId'> {}

/**
 * Modelo Sequelize para a entidade OutraDespesaReceita
 *
 * Registro de outras despesas e receitas vinculadas a planos gerenciais
 */
class OutraDespesaReceita
  extends Model<OutraDespesaReceitaAttributes, OutraDespesaReceitaCreationAttributes>
  implements OutraDespesaReceitaAttributes
{
  public id!: number;
  public tenantId!: number;
  public planoGerencialId!: number;
  public dataMovimento!: string;
  public valor!: number;
  public observacoes!: string | null;
  public tipo!: 'RECEITA' | 'DESPESA';
  public tipoAlocacao!: 'PROPRIEDADE' | 'CONFIGURADOR_CICLO';
  public configuradorCicloId!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public planoGerencial?: PlanoContaGerencial;
  public configuradorCiclo?: ConfiguradorCiclo;
  public usuarioCriador?: Usuario;
}

OutraDespesaReceita.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da outra despesa/receita',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o registro pertence',
    },
    planoGerencialId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do plano de conta gerencial',
      references: {
        model: 'C013_planoContaGerencial',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    dataMovimento: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do movimento',
    },
    valor: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      comment: 'Valor da despesa/receita (mínimo 0.01)',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais',
    },
    tipo: {
      type: DataTypes.ENUM('RECEITA', 'DESPESA'),
      allowNull: false,
      comment: 'Tipo do lançamento: RECEITA ou DESPESA',
    },
    tipoAlocacao: {
      type: DataTypes.ENUM('PROPRIEDADE', 'CONFIGURADOR_CICLO'),
      allowNull: false,
      comment: 'Tipo de alocação: PROPRIEDADE ou CONFIGURADOR_CICLO',
    },
    configuradorCicloId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do configurador de ciclo (obrigatório quando tipoAlocacao = CONFIGURADOR_CICLO)',
      references: {
        model: 'C035_configuradorCiclo',
        key: 'id_cfg',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    tableName: 'C051_outraDespesaReceita',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['planoGerencialId'],
      },
      {
        fields: ['dataMovimento'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['tipoAlocacao'],
      },
      {
        fields: ['configuradorCicloId'],
      },
      {
        fields: ['usercreation'],
      },
    ],
  }
);

// Setup associations
OutraDespesaReceita.belongsTo(PlanoContaGerencial, { foreignKey: 'planoGerencialId', as: 'planoGerencial' });
OutraDespesaReceita.belongsTo(ConfiguradorCiclo, { foreignKey: 'configuradorCicloId', as: 'configuradorCiclo' });
OutraDespesaReceita.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });

export default OutraDespesaReceita;
