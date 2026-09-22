import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Adicionar tenantId em tabelas dependentes
 * 
 * Esta migration adiciona a coluna tenantId nas seguintes tabelas:
 * - eventos
 * - locais
 * - lembretes
 * - financeiros
 * - audit_logs
 * - lembrete_data_hora
 * - usuario_has_role
 * 
 * As colunas são inicialmente nullable e serão populadas na migração de dados.
 * Depois serão alteradas para NOT NULL.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // eventos
  await queryInterface.addColumn('eventos', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o evento pertence',
  });
  await queryInterface.addIndex('eventos', ['tenantId'], {
    name: 'idx_eventos_tenantId',
  });

  // locais
  await queryInterface.addColumn('locais', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o local pertence',
  });
  await queryInterface.addIndex('locais', ['tenantId'], {
    name: 'idx_locais_tenantId',
  });

  // lembretes
  await queryInterface.addColumn('lembretes', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o lembrete pertence',
  });
  await queryInterface.addIndex('lembretes', ['tenantId'], {
    name: 'idx_lembretes_tenantId',
  });

  // financeiros
  await queryInterface.addColumn('financeiros', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o registro financeiro pertence',
  });
  await queryInterface.addIndex('financeiros', ['tenantId'], {
    name: 'idx_financeiros_tenantId',
  });

  // audit_logs
  await queryInterface.addColumn('audit_logs', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o log de auditoria pertence',
  });
  await queryInterface.addIndex('audit_logs', ['tenantId'], {
    name: 'idx_audit_logs_tenantId',
  });

  // lembrete_data_hora
  await queryInterface.addColumn('lembretes_data_hora', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o lembrete_data_hora pertence',
  });
  await queryInterface.addIndex('lembretes_data_hora', ['tenantId'], {
    name: 'idx_lembrete_data_hora_tenantId',
  });

  // usuario_has_role
  await queryInterface.addColumn('usuario_has_role', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o relacionamento usuario-role pertence',
  });
  await queryInterface.addIndex('usuario_has_role', ['tenantId'], {
    name: 'idx_usuario_has_role_tenantId',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remover índices
  await queryInterface.removeIndex('eventos', 'idx_eventos_tenantId');
  await queryInterface.removeIndex('locais', 'idx_locais_tenantId');
  await queryInterface.removeIndex('lembretes', 'idx_lembretes_tenantId');
  await queryInterface.removeIndex('financeiros', 'idx_financeiros_tenantId');
  await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_tenantId');
  await queryInterface.removeIndex('lembretes_data_hora', 'idx_lembrete_data_hora_tenantId');
  await queryInterface.removeIndex('usuario_has_role', 'idx_usuario_has_role_tenantId');

  // Remover colunas
  await queryInterface.removeColumn('eventos', 'tenantId');
  await queryInterface.removeColumn('locais', 'tenantId');
  await queryInterface.removeColumn('lembretes', 'tenantId');
  await queryInterface.removeColumn('financeiros', 'tenantId');
  await queryInterface.removeColumn('audit_logs', 'tenantId');
  await queryInterface.removeColumn('lembretes_data_hora', 'tenantId');
  await queryInterface.removeColumn('usuario_has_role', 'tenantId');
}
