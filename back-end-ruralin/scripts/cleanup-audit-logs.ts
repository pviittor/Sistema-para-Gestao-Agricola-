/**
 * Script de limpeza de logs de auditoria
 * 
 * Este script pode ser executado manualmente ou agendado via cron para
 * limpar logs de auditoria antigos conforme política de retenção.
 * 
 * Uso:
 *   npm run cleanup-audit-logs
 *   ou
 *   ts-node scripts/cleanup-audit-logs.ts
 * 
 * Variáveis de ambiente:
 *   AUDIT_LOG_RETENTION_DAYS - Número de dias de retenção (padrão: 365)
 */

import dotenv from 'dotenv';
import { initializeContainer, container } from '../src/core/di/container';
import { TYPES } from '../src/core/di/types';
import { IAuditLogCleanupService } from '../src/application/services/auditLog/IAuditLogCleanupService';

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Função principal para executar limpeza de logs
 */
async function main() {
  try {
    console.log('Initializing DI container...');
    initializeContainer();

    console.log('Resolving AuditLogCleanupService...');
    const cleanupService = container.resolve<IAuditLogCleanupService>(
      TYPES.IAuditLogCleanupService
    );

    const retentionDays = cleanupService.getRetentionDays();
    const cutoffDate = cleanupService.getCutoffDate();

    console.log(`\nAudit Log Cleanup Configuration:`);
    console.log(`  Retention Days: ${retentionDays}`);
    console.log(`  Cutoff Date: ${cutoffDate.toISOString()}`);
    console.log(`  (Logs older than this date will be deleted)\n`);

    console.log('Starting cleanup...');
    const deleted = await cleanupService.cleanupOldLogs();

    console.log(`\n✅ Cleanup completed successfully!`);
    console.log(`   Deleted ${deleted} audit log(s)`);

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error during cleanup:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

export { main };
