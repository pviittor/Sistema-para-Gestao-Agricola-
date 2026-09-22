import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Usuario from './Usuario';
import UnidadeMedida from './UnidadeMedida';
import GrupoProduto from './GrupoProduto';
import SubGrupoProduto from './SubGrupoProduto';
import PrincipioAtivo from './PrincipioAtivo';
import Pessoa from './Pessoa';
import Moeda from './Moeda';

/**
 * Interface para atributos da entidade Produto
 */
interface ProdutoAttributes {
  id_prod: number;
  tenantId: number;
  descricao_prod: string;
  idUnidadeMedida: number;
  pesoliquido_prod: number;
  idGrupo: number;
  idSubGrupo: number;
  idPrincipioAtivo?: number | null;
  idFabricante?: number | null;
  precomedio_prod: number;
  valorultimaentrada_prod: number;
  dataultimaentrada_prod?: Date | null;
  combustivel_prod: boolean;
  custoUltimoCusto_prod: boolean;
  valorUltimoCusto_prod: number;
  atualizacaoCusto_prod?: Date | null;
  observacao_prod?: string | null;
  idIndexador?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criação (id_prod é opcional pois é auto-increment)
 */
interface ProdutoCreationAttributes extends Optional<ProdutoAttributes, 'id_prod' | 'datecreation'> {}

/**
 * Modelo Sequelize para a entidade Produto
 * 
 * Produtos do sistema
 */
class Produto
  extends Model<ProdutoAttributes, ProdutoCreationAttributes>
  implements ProdutoAttributes
{
  public id_prod!: number;
  public tenantId!: number;
  public descricao_prod!: string;
  public idUnidadeMedida!: number;
  public pesoliquido_prod!: number;
  public idGrupo!: number;
  public idSubGrupo!: number;
  public idPrincipioAtivo!: number | null;
  public idFabricante!: number | null;
  public precomedio_prod!: number;
  public valorultimaentrada_prod!: number;
  public dataultimaentrada_prod!: Date | null;
  public combustivel_prod!: boolean;
  public custoUltimoCusto_prod!: boolean;
  public valorUltimoCusto_prod!: number;
  public atualizacaoCusto_prod!: Date | null;
  public observacao_prod!: string | null;
  public idIndexador!: number | null;
  public usercreation!: number;
  public datecreation!: Date;
}

Produto.init(
  {
    id_prod: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do produto',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual o produto pertence',
    },
    descricao_prod: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Descrição do produto',
    },
    idUnidadeMedida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de medida',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    pesoliquido_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Peso líquido do produto',
    },
    idGrupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do grupo de produto',
      references: {
        model: 'grupos_produto',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idSubGrupo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do subgrupo de produto',
      references: {
        model: 'C003_SubGrupoProduto',
        key: 'id_sub',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idPrincipioAtivo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do princípio ativo',
      references: {
        model: 'C004_PrincipioAtivo',
        key: 'id_principio',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    idFabricante: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do fabricante (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    precomedio_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Preço médio do produto',
    },
    valorultimaentrada_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor da última entrada do produto',
    },
    dataultimaentrada_prod: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data da última entrada do produto',
    },
    combustivel_prod: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o produto é combustível',
    },
    custoUltimoCusto_prod: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o produto utiliza o último custo',
    },
    valorUltimoCusto_prod: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Valor do último custo do produto',
    },
    atualizacaoCusto_prod: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de atualização do custo',
    },
    observacao_prod: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre o produto',
    },
    idIndexador: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do indexador (moeda)',
      references: {
        model: 'C006_moeda',
        key: 'id_moeda',
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
    tableName: 'C008_produto',
    timestamps: false,
    underscored: false,
  }
);

// Setup associations
Produto.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
Produto.belongsTo(UnidadeMedida, { foreignKey: 'idUnidadeMedida', as: 'unidadeMedida' });
Produto.belongsTo(GrupoProduto, { foreignKey: 'idGrupo', as: 'grupo' });
Produto.belongsTo(SubGrupoProduto, { foreignKey: 'idSubGrupo', as: 'subGrupo' });
Produto.belongsTo(PrincipioAtivo, { foreignKey: 'idPrincipioAtivo', as: 'principioAtivo' });
Produto.belongsTo(Pessoa, { foreignKey: 'idFabricante', as: 'fabricante' });
Produto.belongsTo(Moeda, { foreignKey: 'idIndexador', as: 'indexador' });

export default Produto;
