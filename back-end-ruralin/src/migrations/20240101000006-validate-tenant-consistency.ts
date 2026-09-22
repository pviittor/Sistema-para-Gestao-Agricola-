import { QueryInterface, QueryTypes } from 'sequelize';

/**
 * Migration: Validar consistência de tenantId
 * 
 * Esta migration valida a consistência de tenantId em todos os relacionamentos:
 * - eventos -> usuarios: tenantId deve ser igual
 * - eventos -> locais: tenantId deve ser igual
 * - locais -> usuarios: tenantId deve ser igual
 * - lembretes -> usuarios: tenantId deve ser igual
 * - financeiros -> usuarios: tenantId deve ser igual
 * - lembrete_data_hora -> lembretes: tenantId deve ser igual
 * - usuario_has_role -> usuarios: tenantId deve ser igual
 * 
 * IMPORTANTE: Esta migration é apenas de validação e não modifica dados.
 * Se encontrar inconsistências, lança erro e interrompe a migração.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // 1. Validar consistência eventos -> usuarios
  const eventosUsuarios = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM eventos e
    JOIN usuarios u ON u.id = e.usuarioId
    WHERE e.tenantId != u.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (eventosUsuarios && eventosUsuarios.length > 0 && eventosUsuarios[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${eventosUsuarios[0].inconsistencias} eventos com tenantId diferente do usuario`);
  }

  // 2. Validar consistência eventos -> locais
  const eventosLocais = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM eventos e
    JOIN locais l ON l.id = e.localId
    WHERE e.tenantId != l.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (eventosLocais && eventosLocais.length > 0 && eventosLocais[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${eventosLocais[0].inconsistencias} eventos com tenantId diferente do local`);
  }

  // 3. Validar consistência locais -> usuarios
  const locaisUsuarios = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM locais l
    JOIN usuarios u ON u.id = l.usuarioId
    WHERE l.tenantId != u.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (locaisUsuarios && locaisUsuarios.length > 0 && locaisUsuarios[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${locaisUsuarios[0].inconsistencias} locais com tenantId diferente do usuario`);
  }

  // 4. Validar consistência lembretes -> usuarios
  const lembretesUsuarios = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM lembretes l
    JOIN usuarios u ON u.id = l.usuarioId
    WHERE l.tenantId != u.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (lembretesUsuarios && lembretesUsuarios.length > 0 && lembretesUsuarios[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${lembretesUsuarios[0].inconsistencias} lembretes com tenantId diferente do usuario`);
  }

  // 5. Validar consistência financeiros -> usuarios
  const financeirosUsuarios = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM financeiros f
    JOIN usuarios u ON u.id = f.usuarioId
    WHERE f.tenantId != u.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (financeirosUsuarios && financeirosUsuarios.length > 0 && financeirosUsuarios[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${financeirosUsuarios[0].inconsistencias} financeiros com tenantId diferente do usuario`);
  }

  // 6. Validar consistência lembrete_data_hora -> lembretes
  // Nota: Tabela no banco é 'lembretes_data_hora' (plural)
  const lembreteDataHoraLembretes = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM lembretes_data_hora ldh
    JOIN lembretes l ON l.id = ldh.lembreteId
    WHERE ldh.tenantId != l.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (lembreteDataHoraLembretes && lembreteDataHoraLembretes.length > 0 && lembreteDataHoraLembretes[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${lembreteDataHoraLembretes[0].inconsistencias} lembrete_data_hora com tenantId diferente do lembrete`);
  }

  // 7. Validar consistência usuario_has_role -> usuarios
  const usuarioHasRoleUsuarios = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM usuario_has_role uhr
    JOIN usuarios u ON u.id = uhr.usuarioId
    WHERE uhr.tenantId != u.tenantId;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (usuarioHasRoleUsuarios && usuarioHasRoleUsuarios.length > 0 && usuarioHasRoleUsuarios[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${usuarioHasRoleUsuarios[0].inconsistencias} usuario_has_role com tenantId diferente do usuario`);
  }

  // 8. Validar consistência audit_logs -> usuarios (apenas os que têm userId)
  const auditLogsUsuarios = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as inconsistencias
    FROM audit_logs al
    JOIN usuarios u ON u.id = al.userId
    WHERE al.tenantId != u.tenantId
    AND al.userId IS NOT NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (auditLogsUsuarios && auditLogsUsuarios.length > 0 && auditLogsUsuarios[0].inconsistencias > 0) {
    throw new Error(`Inconsistência encontrada: ${auditLogsUsuarios[0].inconsistencias} audit_logs com tenantId diferente do usuario`);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Esta migration é apenas de validação, não há rollback necessário
  // O rollback seria feito pelas migrations anteriores
}
