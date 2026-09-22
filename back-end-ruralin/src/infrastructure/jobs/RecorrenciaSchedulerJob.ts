/**
 * RecorrenciaSchedulerJob — Job BullMQ para geração automática de lançamentos recorrentes e alertas
 *
 * Executa diariamente às 06h00:
 * 1. RecorrenciaFinanceiraApplicationService.gerarProximosLancamentos()
 * 2. AlertaVencimentoConfigApplicationService.processarAlertasVencimento()
 */

import { container } from '../../core/di';
import { TYPES } from '../../core/di/types';
import { IRecorrenciaFinanceiraApplicationService } from '../../application/services/recorrenciaFinanceira/IRecorrenciaFinanceiraApplicationService';
import { IAlertaVencimentoConfigApplicationService } from '../../application/services/alertaVencimentoConfig/IAlertaVencimentoConfigApplicationService';

let Queue: any;
let Worker: any;

try {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue;
  Worker = bullmq.Worker;
} catch {
  console.warn('BullMQ not installed. Scheduler will not run. Install with: npm install bullmq');
}

const QUEUE_NAME = 'recorrencia-scheduler';
const JOB_NAME = 'processar-recorrencias-alertas';

/**
 * Inicializa o scheduler de recorrência e alertas
 */
export function inicializarRecorrenciaScheduler(): void {
  if (!Queue || !Worker) {
    console.warn('BullMQ não disponível. Scheduler de recorrência desabilitado.');
    return;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const connection = { url: redisUrl };

  const queue = new Queue(QUEUE_NAME, { connection });

  // Adicionar job recorrente (06h00 diário)
  queue.add(JOB_NAME, {}, {
    repeat: {
      pattern: '0 6 * * *',
    },
    removeOnComplete: { count: 30 },
    removeOnFail: { count: 50 },
  }).then(() => {
    console.log(`[RecorrenciaScheduler] Job agendado: ${JOB_NAME} (diário às 06h00)`);
  }).catch((err: Error) => {
    console.error(`[RecorrenciaScheduler] Erro ao agendar job: ${err.message}`);
  });

  // Worker que processa o job
  const worker = new Worker(QUEUE_NAME, async () => {
    console.log(`[RecorrenciaScheduler] Executando processamento...`);
    const inicio = Date.now();

    try {
      // 1. Gerar lançamentos recorrentes
      const recorrenciaService = container.resolve<IRecorrenciaFinanceiraApplicationService>(
        TYPES.IRecorrenciaFinanceiraApplicationService
      );
      const resultRecorrencia = await recorrenciaService.gerarProximosLancamentos();
      console.log(`[RecorrenciaScheduler] Recorrências: ${resultRecorrencia.gerados} gerados, ${resultRecorrencia.ignorados} ignorados, ${resultRecorrencia.erros} erros`);

      // 2. Processar alertas de vencimento
      const alertaService = container.resolve<IAlertaVencimentoConfigApplicationService>(
        TYPES.IAlertaVencimentoConfigApplicationService
      );
      const resultAlerta = await alertaService.processarAlertasVencimento();
      console.log(`[RecorrenciaScheduler] Alertas: ${resultAlerta.lembretes_criados} criados, ${resultAlerta.parcelas_processadas} processadas`);

      const duracao = Date.now() - inicio;
      console.log(`[RecorrenciaScheduler] Processamento concluído em ${duracao}ms`);

      return { recorrencia: resultRecorrencia, alertas: resultAlerta, duracao };
    } catch (error: any) {
      console.error(`[RecorrenciaScheduler] Erro no processamento: ${error.message}`);
      throw error;
    }
  }, { connection });

  worker.on('failed', (job: any, err: Error) => {
    console.error(`[RecorrenciaScheduler] Job falhou: ${err.message}`);
  });

  console.log('[RecorrenciaScheduler] Worker inicializado.');
}
