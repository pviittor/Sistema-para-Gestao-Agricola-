import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar tenantId em usuarios
 * 
 * Esta migration adiciona a coluna tenantId na tabela usuarios.
 * A coluna é inicialmente nullable e será populada na migração de dados.
 * Depois será alterada para NOT NULL.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('usuarios', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true, // Será populado na migração de dados, depois será NOT NULL
    comment: 'ID do tenant ao qual o usuário pertence',
  });

  await queryInterface.addIndex('usuarios', ['tenantId'], {
    name: 'idx_usuarios_tenantId',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('usuarios', 'idx_usuarios_tenantId');
  await queryInterface.removeColumn('usuarios', 'tenantId');
}
