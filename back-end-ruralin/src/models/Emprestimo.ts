import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Fazenda from './Fazenda';
import Pessoa from './Pessoa';

/**
 * Interface para atributos da entidade Emprestimo
 */
interface EmprestimoAttributes {
  id: number;
  tenantId: number;
  fazendaId: number;
  parceiroId: number;
  data_emp: string;
  devolucao_emp: string | null;
  encerramento_emp: string | null;
  tipo_emp: number;
  situacao_emp: number;
  observacao_emp: string | null;
  prazo_dias: number | null;
  data_limite_devolucao: string | null;
  multa_percentual: number | null;
  juros_diario_percentual: number | null;
  financeiro_gerado: boolean;
  valor_custo_medio_total: number | null;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface EmprestimoCreationAttributes extends Optional<EmprestimoAttributes, 'id' | 'devolucao_emp' | 'encerramento_emp' | 'situacao_emp' | 'observacao_emp' | 'prazo_dias' | 'data_limite_devolucao' | 'multa_percentual' | 'juros_diario_percentual' | 'financeiro_gerado' | 'valor_custo_medio_total'> {}

/**
 * Modelo Sequelize para a entidade Emprestimo
 *
 * Representa um empréstimo de produto ou máquina vinculado a uma fazenda
 * e a um parceiro de campo.
 */
class Emprestimo extends Model<EmprestimoAttributes, EmprestimoCreationAttributes> implements EmprestimoAttributes {
  public id!: number;
  public tenantId!: number;
  public fazendaId!: number;
  public parceiroId!: number;
  public data_emp!: string;
  public devolucao_emp!: string | null;
  public encerramento_emp!: string | null;
  public tipo_emp!: number;
  public situacao_emp!: number;
  public observacao_emp!: string | null;
  public prazo_dias!: number | null;
  public data_limite_devolucao!: string | null;
  public multa_percentual!: number | null;
  public juros_diario_percentual!: number | null;
  public financeiro_gerado!: boolean;
  public valor_custo_medio_total!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relacionamentos
  public fazenda?: Fazenda;
  public parceiro?: Pessoa;
}

Emprestimo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do empréstimo (auto-increment)',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o empréstimo pertence',
    },
    fazendaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da fazenda vinculada ao empréstimo',
      references: {
        model: 'C018_fazenda',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    parceiroId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do parceiro (pessoa) vinculado ao empréstimo',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    data_emp: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do empréstimo',
    },
    devolucao_emp: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data prevista de devolução',
    },
    encerramento_emp: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Data de encerramento efetivo do empréstimo',
    },
    tipo_emp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Tipo do empréstimo: 0=Produto, 1=Máquina',
    },
    situacao_emp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Situação do empréstimo: 0=Em aberto, 1=Parcialmente devolvido, 2=Concluído',
    },
    observacao_emp: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais sobre o empréstimo',
    },
    prazo_dias: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Prazo em dias para devolução',
    },
    data_limite_devolucao: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'data_emp + prazo_dias, calculado pelo service',
    },
    multa_percentual: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: '% de multa sobre valor total',
    },
    juros_diario_percentual: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: true,
      comment: '% de juros ao dia sobre valor total',
    },
    financeiro_gerado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se já gerou título financeiro de cobrança',
    },
    valor_custo_medio_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Soma dos total_empi dos itens — custo total do empréstimo',
    },
  },
  {
    sequelize,
    tableName: 'emprestimos',
    indexes: [
      { fields: ['tenantId'] },
      { fields: ['fazendaId'] },
      { fields: ['parceiroId'] },
      { fields: ['situacao_emp'] },
      { fields: ['data_emp'] },
    ],
  }
);

// Setup associations
Emprestimo.belongsTo(Fazenda, { foreignKey: 'fazendaId', as: 'fazenda' });
Emprestimo.belongsTo(Pessoa, { foreignKey: 'parceiroId', as: 'parceiro' });

export default Emprestimo;
