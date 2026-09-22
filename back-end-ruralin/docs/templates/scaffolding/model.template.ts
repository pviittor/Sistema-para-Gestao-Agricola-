/**
 * TEMPLATE: Sequelize Model
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase (ex: Evento, Local)
 * - {{TableName}}: Nome da tabela em snake_case (ex: eventos, locais)
 * - {{EntityDescription}}: Descrição da entidade
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
// TODO: Importar modelos relacionados quando necessário
// import RelatedModel from './RelatedModel';

/**
 * Interface para atributos da entidade {{EntityName}}
 */
interface {{EntityName}}Attributes {
  id: number;
  {{#if multiTenant}}
  tenantId: number;
  {{/if}}
  // TODO: Adicionar campos da entidade baseado na especificação
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para atributos de criação (id é opcional pois é auto-increment)
 */
interface {{EntityName}}CreationAttributes extends Optional<{{EntityName}}Attributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Modelo Sequelize para a entidade {{EntityName}}
 * 
 * {{EntityDescription}}
 */
class {{EntityName}}
  extends Model<{{EntityName}}Attributes, {{EntityName}}CreationAttributes>
  implements {{EntityName}}Attributes
{
  public id!: number;
  {{#if multiTenant}}
  public tenantId!: number;
  {{/if}}
  // TODO: Adicionar propriedades públicas baseadas nos campos da especificação
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

{{EntityName}}.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único da {{entityName}}',
    },
    {{#if multiTenant}}
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual a {{entityName}} pertence',
    },
    {{/if}}
    // TODO: Adicionar campos baseados na especificação
    // Exemplo:
    // nome: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   comment: 'Nome da {{entityName}}',
    // },
  },
  {
    sequelize,
    tableName: '{{TableName}}',
    timestamps: true,
    underscored: true,
  }
);

// TODO: Configurar relacionamentos baseados na especificação
// Exemplo:
// {{EntityName}}.belongsTo(RelatedModel, { foreignKey: 'relatedId', as: 'related' });
// {{EntityName}}.hasMany(RelatedModel, { foreignKey: '{{entityName}}Id', as: 'relatedItems' });

export default {{EntityName}};
