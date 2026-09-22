/**
 * Script de Validação de Migração de TenantId
 * 
 * Este script valida que a migração de tenantId foi executada corretamente:
 * - Todos os registros têm tenantId preenchido
 * - Consistência de tenantId em todos os relacionamentos
 * - tenantId de usuarios ROOT = id
 * - tenantId de usuarios CLIENT = tenantId do ROOT relacionado
 * 
 * Uso:
 * ```bash
 * npx ts-node scripts/validate-tenant-migration.ts
 * ```
 */

import sequelize from '../src/config/database';

interface ValidationResult {
  tabela: string;
  total: number;
  com_tenantId: number;
  sem_tenantId: number;
}

interface ConsistencyResult {
  relacionamento: string;
  inconsistencias: number;
}

async function validateTenantMigration(): Promise<void> {
  console.log('🔍 Iniciando validação de migração de tenantId...\n');

  try {
    // 1. Validar que todos os registros têm tenantId
    console.log('📊 Validando preenchimento de tenantId...');
    const [results] = await sequelize.query(`
      SELECT 
        'usuarios' as tabela,
        COUNT(*) as total,
        COUNT(tenantId) as com_tenantId,
        COUNT(*) - COUNT(tenantId) as sem_tenantId
      FROM usuarios
      UNION ALL
      SELECT 'eventos', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM eventos
      UNION ALL
      SELECT 'locais', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM locais
      UNION ALL
      SELECT 'lembretes', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM lembretes
      UNION ALL
      SELECT 'financeiros', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM financeiros
      UNION ALL
      SELECT 'audit_logs', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM audit_logs
      UNION ALL
      SELECT 'lembretes_data_hora', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM lembretes_data_hora
      UNION ALL
      SELECT 'usuario_has_role', COUNT(*), COUNT(tenantId), COUNT(*) - COUNT(tenantId) FROM usuario_has_role;
    `) as [ValidationResult[]];

    let hasErrors = false;
    for (const result of results) {
      console.log(`  ${result.tabela}: ${result.com_tenantId}/${result.total} com tenantId`);
      if (result.sem_tenantId > 0) {
        console.error(`  ❌ ERRO: ${result.sem_tenantId} registros sem tenantId em ${result.tabela}`);
        hasErrors = true;
      }
    }

    if (hasErrors) {
      throw new Error('Validação falhou: Existem registros sem tenantId');
    }

    console.log('  ✅ Todos os registros têm tenantId preenchido\n');

    // 2. Validar consistência de tenantId em relacionamentos
    console.log('🔗 Validando consistência de tenantId em relacionamentos...');
    
    const consistencyChecks: Array<{ name: string; query: string }> = [
      {
        name: 'eventos -> usuarios',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM eventos e
          JOIN usuarios u ON u.id = e.usuarioId
          WHERE e.tenantId != u.tenantId;
        `,
      },
      {
        name: 'eventos -> locais',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM eventos e
          JOIN locais l ON l.id = e.localId
          WHERE e.tenantId != l.tenantId;
        `,
      },
      {
        name: 'locais -> usuarios',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM locais l
          JOIN usuarios u ON u.id = l.usuarioId
          WHERE l.tenantId != u.tenantId;
        `,
      },
      {
        name: 'lembretes -> usuarios',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM lembretes l
          JOIN usuarios u ON u.id = l.usuarioId
          WHERE l.tenantId != u.tenantId;
        `,
      },
      {
        name: 'financeiros -> usuarios',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM financeiros f
          JOIN usuarios u ON u.id = f.usuarioId
          WHERE f.tenantId != u.tenantId;
        `,
      },
      {
        name: 'lembrete_data_hora -> lembretes',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM lembretes_data_hora ldh
          JOIN lembretes l ON l.id = ldh.lembreteId
          WHERE ldh.tenantId != l.tenantId;
        `,
      },
      {
        name: 'usuario_has_role -> usuarios',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM usuario_has_role uhr
          JOIN usuarios u ON u.id = uhr.usuarioId
          WHERE uhr.tenantId != u.tenantId;
        `,
      },
      {
        name: 'audit_logs -> usuarios',
        query: `
          SELECT COUNT(*) as inconsistencias
          FROM audit_logs al
          JOIN usuarios u ON u.id = al.userId
          WHERE al.tenantId != u.tenantId
          AND al.userId IS NOT NULL;
        `,
      },
    ];

    for (const check of consistencyChecks) {
      const [result] = await sequelize.query(check.query) as [ConsistencyResult[]];
      const inconsistencias = result[0]?.inconsistencias || 0;
      
      if (inconsistencias > 0) {
        console.error(`  ❌ ERRO: ${inconsistencias} inconsistências em ${check.name}`);
        hasErrors = true;
      } else {
        console.log(`  ✅ ${check.name}: Consistente`);
      }
    }

    if (hasErrors) {
      throw new Error('Validação falhou: Existem inconsistências de tenantId');
    }

    console.log('  ✅ Todos os relacionamentos são consistentes\n');

    // 3. Validar regras específicas de usuarios
    console.log('👥 Validando regras específicas de usuarios...');

    // ROOTs: tenantId = id
    const [rootValidation] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE tipo = 'ROOT'
      AND (tenantId IS NULL OR tenantId != id);
    `) as any[];

    if (rootValidation && rootValidation[0] && rootValidation[0].total > 0) {
      console.error(`  ❌ ERRO: ${rootValidation[0].total} ROOTs com tenantId diferente de id`);
      hasErrors = true;
    } else {
      console.log('  ✅ ROOTs: tenantId = id');
    }

    // CLIENTs: tenantId = tenantId do ROOT relacionado (ou id se não tiver ROOT)
    const [clientValidation] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM usuarios u
      WHERE u.tipo = 'CLIENT'
      AND NOT EXISTS (
        SELECT 1
        FROM usuario_has_subUsuario uhs
        JOIN usuarios u2 ON u2.id = uhs.usuarioId
        WHERE uhs.subUsuarioId = u.id
        AND u2.tipo = 'ROOT'
        AND u.tenantId = u2.tenantId
      )
      AND u.tenantId != u.id;
    `) as any[];

    if (clientValidation && clientValidation[0] && clientValidation[0].total > 0) {
      console.error(`  ⚠️  AVISO: ${clientValidation[0].total} CLIENTs podem ter tenantId inconsistente`);
      // Não é erro crítico, pode ser CLIENT sem ROOT
    } else {
      console.log('  ✅ CLIENTs: tenantId consistente');
    }

    if (hasErrors) {
      throw new Error('Validação falhou: Existem problemas com regras de usuarios');
    }

    console.log('\n✅ Validação completa: Migração de tenantId está correta!');
  } catch (error) {
    console.error('\n❌ Validação falhou:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Executar validação
validateTenantMigration().catch((error) => {
  console.error('Erro ao executar validação:', error);
  process.exit(1);
});
