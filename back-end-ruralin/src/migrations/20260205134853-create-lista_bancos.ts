import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela lista_bancos
 *
 * Tabela de referência para lista de bancos utilizados nas contas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'lista_bancos';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('lista_bancos', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do banco',
      },
      codigo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Código do banco (ex: 001, 237)',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome do banco',
      },
    });

    await queryInterface.addIndex('lista_bancos', ['codigo'], {
      name: 'idx_lista_bancos_codigo',
      unique: true,
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('lista_bancos');
}
