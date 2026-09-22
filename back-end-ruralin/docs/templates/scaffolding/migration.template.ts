/**
 * TEMPLATE: Migration
 * 
 * Variáveis de substituição:
 * - {{TableName}}: Nome da tabela em snake_case
 * - {{EntityName}}: Nome da entidade em PascalCase
 * - {{EntityDescription}}: Descrição da entidade
 */

import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration para criar tabela {{TableName}}
 * 
 * {{EntityDescription}}
 */
export default {
  async up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('{{TableName}}', {
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
      //   type: DataTypes.STRING(255),
      //   allowNull: false,
      //   comment: 'Nome da {{entityName}}',
      // },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de atualização',
      },
    });

    // TODO: Criar índices baseados na especificação
    {{#if multiTenant}}
    // Índice para tenantId (multi-tenancy)
    await queryInterface.addIndex('{{TableName}}', ['tenantId'], {
      name: 'idx_{{tableName}}_tenantId',
    });
    {{/if}}
    
    // TODO: Adicionar índices para campos únicos
    // await queryInterface.addIndex('{{TableName}}', ['campoUnico'], {
    //   unique: true,
    //   name: 'idx_{{tableName}}_campoUnico',
    // });

    // TODO: Adicionar foreign keys baseadas nos relacionamentos
    // await queryInterface.addConstraint('{{TableName}}', {
    //   fields: ['relatedId'],
    //   type: 'foreign key',
    //   name: 'fk_{{tableName}}_related',
    //   references: {
    //     table: 'related_table',
    //     field: 'id',
    //   },
    //   onDelete: 'RESTRICT',
    //   onUpdate: 'CASCADE',
    // });
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    // TODO: Remover constraints e índices antes de dropar a tabela
    // await queryInterface.removeConstraint('{{TableName}}', 'fk_{{tableName}}_related');
    // await queryInterface.removeIndex('{{TableName}}', 'idx_{{tableName}}_tenantId');
    
    await queryInterface.dropTable('{{TableName}}');
  },
};
