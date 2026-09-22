import { QueryInterface, QueryTypes } from 'sequelize';

/**
 * Migration: Popular tenantId em tabelas dependentes
 * 
 * Esta migration popula o tenantId em todas as tabelas dependentes baseado
 * nos relacionamentos com usuarios:
 * - eventos: tenantId do usuarioId
 * - locais: tenantId do usuarioId
 * - lembretes: tenantId do usuarioId
 * - financeiros: tenantId do usuarioId
 * - audit_logs: tenantId do userId
 * - lembrete_data_hora: tenantId do lembreteId (via lembretes)
 * - usuario_has_role: tenantId do usuarioId
 * 
 * IMPORTANTE: Esta migration deve ser executada APÓS:
 * - 20240101000001-add-tenantId-to-usuarios.ts
 * - 20240101000002-add-tenantId-to-dependent-tables.ts
 * - 20240101000003-populate-tenantId-usuarios.ts
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. eventos: tenantId do usuarioId
  await queryInterface.sequelize.query(`
    UPDATE eventos e
    SET e.tenantId = (
      SELECT u.tenantId
      FROM usuarios u
      WHERE u.id = e.usuarioId
      LIMIT 1
    )
    WHERE e.tenantId IS NULL;
  `);

  // Validar eventos
  const eventosValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM eventos
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (eventosValidation && eventosValidation.length > 0 && eventosValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${eventosValidation[0].sem_tenantId} eventos sem tenantId`);
  }

  // 2. locais: tenantId do usuarioId
  await queryInterface.sequelize.query(`
    UPDATE locais l
    SET l.tenantId = (
      SELECT u.tenantId
      FROM usuarios u
      WHERE u.id = l.usuarioId
      LIMIT 1
    )
    WHERE l.tenantId IS NULL;
  `);

  // Validar locais
  const locaisValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM locais
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (locaisValidation && locaisValidation.length > 0 && locaisValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${locaisValidation[0].sem_tenantId} locais sem tenantId`);
  }

  // 3. lembretes: tenantId do usuarioId
  await queryInterface.sequelize.query(`
    UPDATE lembretes l
    SET l.tenantId = (
      SELECT u.tenantId
      FROM usuarios u
      WHERE u.id = l.usuarioId
      LIMIT 1
    )
    WHERE l.tenantId IS NULL;
  `);

  // Validar lembretes
  const lembretesValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM lembretes
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (lembretesValidation && lembretesValidation.length > 0 && lembretesValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${lembretesValidation[0].sem_tenantId} lembretes sem tenantId`);
  }

  // 4. financeiros: tenantId do usuarioId
  await queryInterface.sequelize.query(`
    UPDATE financeiros f
    SET f.tenantId = (
      SELECT u.tenantId
      FROM usuarios u
      WHERE u.id = f.usuarioId
      LIMIT 1
    )
    WHERE f.tenantId IS NULL;
  `);

  // Validar financeiros
  const financeirosValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM financeiros
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (financeirosValidation && financeirosValidation.length > 0 && financeirosValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${financeirosValidation[0].sem_tenantId} financeiros sem tenantId`);
  }

  // 5. audit_logs: tenantId do userId
  await queryInterface.sequelize.query(`
    UPDATE audit_logs al
    SET al.tenantId = (
      SELECT u.tenantId
      FROM usuarios u
      WHERE u.id = al.userId
      LIMIT 1
    )
    WHERE al.tenantId IS NULL
    AND al.userId IS NOT NULL;
  `);

  // Validar audit_logs (apenas os que têm userId)
  const auditLogsValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM audit_logs
    WHERE tenantId IS NULL
    AND userId IS NOT NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (auditLogsValidation && auditLogsValidation.length > 0 && auditLogsValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${auditLogsValidation[0].sem_tenantId} audit_logs sem tenantId`);
  }

  // 6. lembrete_data_hora: tenantId do lembreteId (via lembretes)
  // Nota: A tabela no banco é 'lembretes_data_hora' (plural)
  await queryInterface.sequelize.query(`
    UPDATE lembretes_data_hora ldh
    SET ldh.tenantId = (
      SELECT l.tenantId
      FROM lembretes l
      WHERE l.id = ldh.lembreteId
      LIMIT 1
    )
    WHERE ldh.tenantId IS NULL;
  `);

  // Validar lembrete_data_hora
  const lembreteDataHoraValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM lembretes_data_hora
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (lembreteDataHoraValidation && lembreteDataHoraValidation.length > 0 && lembreteDataHoraValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${lembreteDataHoraValidation[0].sem_tenantId} lembrete_data_hora sem tenantId`);
  }

  // 7. usuario_has_role: tenantId do usuarioId
  await queryInterface.sequelize.query(`
    UPDATE usuario_has_role uhr
    SET uhr.tenantId = (
      SELECT u.tenantId
      FROM usuarios u
      WHERE u.id = uhr.usuarioId
      LIMIT 1
    )
    WHERE uhr.tenantId IS NULL;
  `);

  // Validar usuario_has_role
  const usuarioHasRoleValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM usuario_has_role
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (usuarioHasRoleValidation && usuarioHasRoleValidation.length > 0 && usuarioHasRoleValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${usuarioHasRoleValidation[0].sem_tenantId} usuario_has_role sem tenantId`);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Rollback: limpar todos os tenantIds das tabelas dependentes
  await queryInterface.sequelize.query(`
    UPDATE eventos SET tenantId = NULL;
    UPDATE locais SET tenantId = NULL;
    UPDATE lembretes SET tenantId = NULL;
    UPDATE financeiros SET tenantId = NULL;
    UPDATE audit_logs SET tenantId = NULL;
    UPDATE lembretes_data_hora SET tenantId = NULL;
    UPDATE usuario_has_role SET tenantId = NULL;
  `);
}
