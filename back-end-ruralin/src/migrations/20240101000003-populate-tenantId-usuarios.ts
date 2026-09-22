import { QueryInterface, QueryTypes } from 'sequelize';

/**
 * Migration: Popular tenantId em usuarios
 * 
 * Esta migration popula o tenantId em todos os registros de usuarios:
 * 1. ROOTs: tenantId = id (cada ROOT é seu próprio tenant)
 * 2. CLIENTs: tenantId = tenantId do ROOT relacionado (via usuario_has_subUsuario)
 * 3. CLIENTs sem ROOT: tenantId = id (fallback)
 * 
 * IMPORTANTE: Esta migration deve ser executada APÓS a migration que adiciona
 * a coluna tenantId (20240101000001-add-tenantId-to-usuarios.ts).
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Passo 1: ROOTs recebem tenantId = id
  await queryInterface.sequelize.query(`
    UPDATE usuarios
    SET tenantId = id
    WHERE tipo = 'ROOT'
    AND tenantId IS NULL;
  `);

  // Validar ROOTs
  const rootValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as total
    FROM usuarios
    WHERE tipo = 'ROOT'
    AND (tenantId IS NULL OR tenantId != id);
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (rootValidation && rootValidation.length > 0 && rootValidation[0].total > 0) {
    throw new Error(`Falha na validação: ${rootValidation[0].total} ROOTs sem tenantId correto`);
  }

  // Passo 2: CLIENTs herdam tenantId do ROOT relacionado
  await queryInterface.sequelize.query(`
    UPDATE usuarios u
    SET u.tenantId = (
      SELECT u2.tenantId
      FROM usuario_has_subUsuario uhs
      JOIN usuarios u2 ON u2.id = uhs.usuarioId
      WHERE uhs.subUsuarioId = u.id
      AND u2.tipo = 'ROOT'
      LIMIT 1
    )
    WHERE u.tipo = 'CLIENT'
    AND u.tenantId IS NULL
    AND EXISTS (
      SELECT 1 
      FROM usuario_has_subUsuario uhs
      JOIN usuarios u2 ON u2.id = uhs.usuarioId
      WHERE uhs.subUsuarioId = u.id
      AND u2.tipo = 'ROOT'
    );
  `);

  // Passo 3: CLIENTs sem ROOT recebem tenantId = id (fallback)
  await queryInterface.sequelize.query(`
    UPDATE usuarios
    SET tenantId = id
    WHERE tipo = 'CLIENT'
    AND tenantId IS NULL;
  `);

  // Validação final: todos os usuarios devem ter tenantId
  const finalValidation = await queryInterface.sequelize.query(`
    SELECT COUNT(*) as sem_tenantId
    FROM usuarios
    WHERE tenantId IS NULL;
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  if (finalValidation && finalValidation.length > 0 && finalValidation[0].sem_tenantId > 0) {
    throw new Error(`Falha na validação: ${finalValidation[0].sem_tenantId} usuarios sem tenantId`);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Rollback: limpar todos os tenantIds
  await queryInterface.sequelize.query(`
    UPDATE usuarios
    SET tenantId = NULL;
  `);
}
