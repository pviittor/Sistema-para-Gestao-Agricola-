import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Tornar tenantId NOT NULL
 * 
 * Esta migration altera todas as colunas tenantId para NOT NULL após
 * garantir que todos os registros foram populados.
 * 
 * IMPORTANTE: Esta migration deve ser executada APÓS:
 * - 20240101000001-add-tenantId-to-usuarios.ts
 * - 20240101000002-add-tenantId-to-dependent-tables.ts
 * - 20240101000003-populate-tenantId-usuarios.ts
 * - 20240101000004-populate-tenantId-dependent-tables.ts
 * 
 * E APÓS validar que todos os registros têm tenantId preenchido.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Validar que todos os registros têm tenantId antes de tornar NOT NULL
  const tables = [
    'usuarios',
    'eventos',
    'locais',
    'lembretes',
    'financeiros',
    'audit_logs',
    'lembretes_data_hora', // Tabela no banco é plural
    'usuario_has_role',
  ];

  for (const table of tables) {
    const result = await queryInterface.sequelize.query(`
      SELECT COUNT(*) as sem_tenantId
      FROM ${table}
      WHERE tenantId IS NULL;
    `, {
      type: QueryTypes.SELECT,
    }) as any[];

    if (result && result.length > 0 && result[0].sem_tenantId > 0) {
      throw new Error(`Falha na validação: ${result[0].sem_tenantId} registros sem tenantId na tabela ${table}`);
    }
  }

  // Tornar tenantId NOT NULL em todas as tabelas
  await queryInterface.changeColumn('usuarios', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o usuário pertence',
  });

  await queryInterface.changeColumn('eventos', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o evento pertence',
  });

  await queryInterface.changeColumn('locais', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o local pertence',
  });

  await queryInterface.changeColumn('lembretes', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o lembrete pertence',
  });

  await queryInterface.changeColumn('financeiros', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o registro financeiro pertence',
  });

  await queryInterface.changeColumn('audit_logs', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o log de auditoria pertence',
  });

  await queryInterface.changeColumn('lembretes_data_hora', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o lembrete_data_hora pertence',
  }); // Tabela no banco é 'lembretes_data_hora' (plural)

  await queryInterface.changeColumn('usuario_has_role', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID do tenant ao qual o relacionamento usuario-role pertence',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Rollback: tornar tenantId nullable novamente
  await queryInterface.changeColumn('usuarios', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o usuário pertence',
  });

  await queryInterface.changeColumn('eventos', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o evento pertence',
  });

  await queryInterface.changeColumn('locais', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o local pertence',
  });

  await queryInterface.changeColumn('lembretes', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o lembrete pertence',
  });

  await queryInterface.changeColumn('financeiros', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o registro financeiro pertence',
  });

  await queryInterface.changeColumn('audit_logs', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o log de auditoria pertence',
  });

  await queryInterface.changeColumn('lembretes_data_hora', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o lembrete_data_hora pertence',
  });

  await queryInterface.changeColumn('usuario_has_role', 'tenantId', {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID do tenant ao qual o relacionamento usuario-role pertence',
  });
}
