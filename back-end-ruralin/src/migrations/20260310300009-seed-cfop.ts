import { QueryInterface } from 'sequelize'

/**
 * Seed de CFOPs mais utilizados no agronegócio
 *
 * Fonte: Tabela CFOP da Receita Federal do Brasil
 * Prioridade: CFOPs rurais de entrada (1xxx, 2xxx) e saída (5xxx, 6xxx)
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    const cfops = [
      // === ENTRADAS DENTRO DO ESTADO (1xxx) ===
      { codigo: '1101', descricao: 'Compra para industrialização ou produção rural', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1102', descricao: 'Compra para comercialização', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1111', descricao: 'Compra para industrialização de mercadoria recebida anteriormente em consignação industrial', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1113', descricao: 'Compra para comercialização de mercadoria recebida anteriormente em consignação mercantil', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1116', descricao: 'Compra para industrialização originada de encomenda para recebimento futuro', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1117', descricao: 'Compra para comercialização originada de encomenda para recebimento futuro', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1120', descricao: 'Compra para industrialização em que a mercadoria foi remetida pelo fornecedor ao industrializador', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1121', descricao: 'Compra para comercialização em que a mercadoria foi remetida pelo fornecedor ao industrializador', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1126', descricao: 'Compra para utilização na prestação de serviço sujeita ao ICMS', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1128', descricao: 'Compra para utilização na prestação de serviço sujeita ao ISSQN', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: true },
      { codigo: '1151', descricao: 'Transferência para industrialização ou produção rural', natureza: 'entrada', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '1152', descricao: 'Transferência para comercialização', natureza: 'entrada', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '1201', descricao: 'Devolução de venda de produção do estabelecimento', natureza: 'entrada', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1202', descricao: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros', natureza: 'entrada', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1251', descricao: 'Compra de energia elétrica para distribuição ou comercialização', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1352', descricao: 'Aquisição de serviço de transporte por estabelecimento comercial', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1401', descricao: 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1403', descricao: 'Compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1501', descricao: 'Entrada de mercadoria recebida com fim específico de exportação', natureza: 'entrada', tipo_operacao: 'outras', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '1551', descricao: 'Compra de bem para o ativo imobilizado', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1556', descricao: 'Compra de material para uso ou consumo', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1653', descricao: 'Compra de combustível ou lubrificante por consumidor ou usuário final', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '1901', descricao: 'Entrada para industrialização por encomenda', natureza: 'entrada', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '1902', descricao: 'Retorno de mercadoria remetida para industrialização por encomenda', natureza: 'entrada', tipo_operacao: 'retorno', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '1908', descricao: 'Entrada de bem por conta de contrato de comodato ou empréstimo', natureza: 'entrada', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '1909', descricao: 'Retorno de bem remetido por conta de contrato de comodato ou empréstimo', natureza: 'entrada', tipo_operacao: 'retorno', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '1910', descricao: 'Entrada de bonificação, doação ou brinde', natureza: 'entrada', tipo_operacao: 'bonificacao', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '1949', descricao: 'Outra entrada de mercadoria ou prestação de serviço não especificada', natureza: 'entrada', tipo_operacao: 'outras', gera_financeiro: false, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },

      // === ENTRADAS DE OUTROS ESTADOS (2xxx) ===
      { codigo: '2101', descricao: 'Compra para industrialização ou produção rural', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '2102', descricao: 'Compra para comercialização', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '2151', descricao: 'Transferência para industrialização ou produção rural', natureza: 'entrada', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '2152', descricao: 'Transferência para comercialização', natureza: 'entrada', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '2201', descricao: 'Devolução de venda de produção do estabelecimento', natureza: 'entrada', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '2202', descricao: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros', natureza: 'entrada', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '2551', descricao: 'Compra de bem para o ativo imobilizado', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '2556', descricao: 'Compra de material para uso ou consumo', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '2908', descricao: 'Entrada de bem por conta de contrato de comodato ou empréstimo', natureza: 'entrada', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '2909', descricao: 'Retorno de bem remetido por conta de contrato de comodato ou empréstimo', natureza: 'entrada', tipo_operacao: 'retorno', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '2910', descricao: 'Entrada de bonificação, doação ou brinde', natureza: 'entrada', tipo_operacao: 'bonificacao', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '2949', descricao: 'Outra entrada de mercadoria ou prestação de serviço não especificada', natureza: 'entrada', tipo_operacao: 'outras', gera_financeiro: false, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },

      // === SAÍDAS DENTRO DO ESTADO (5xxx) ===
      { codigo: '5101', descricao: 'Venda de produção do estabelecimento', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5102', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5103', descricao: 'Venda de produção do estabelecimento efetuada fora do estabelecimento', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5104', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros efetuada fora do estabelecimento', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5110', descricao: 'Venda de mercadoria industrializada ou produzida pelo estabelecimento, remetida anteriormente em consignação industrial', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5111', descricao: 'Venda de produção do estabelecimento remetida anteriormente em consignação mercantil', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5112', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros remetida anteriormente em consignação mercantil', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5113', descricao: 'Venda de produção do estabelecimento remetida anteriormente em consignação mercantil', natureza: 'saida', tipo_operacao: 'consignacao', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5151', descricao: 'Transferência de produção do estabelecimento', natureza: 'saida', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '5152', descricao: 'Transferência de mercadoria adquirida ou recebida de terceiros', natureza: 'saida', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '5201', descricao: 'Devolução de compra para industrialização ou produção rural', natureza: 'saida', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5202', descricao: 'Devolução de compra para comercialização', natureza: 'saida', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5401', descricao: 'Venda de produção do estabelecimento em operação com mercadoria sujeita ao regime de substituição tributária', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5403', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5501', descricao: 'Remessa de produção do estabelecimento com fim específico de exportação', natureza: 'saida', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '5551', descricao: 'Venda de bem do ativo imobilizado', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '5556', descricao: 'Devolução de compra de material de uso ou consumo', natureza: 'saida', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '5901', descricao: 'Remessa para industrialização por encomenda', natureza: 'saida', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '5902', descricao: 'Retorno de mercadoria utilizada na industrialização por encomenda', natureza: 'saida', tipo_operacao: 'retorno', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '5908', descricao: 'Remessa de bem por conta de contrato de comodato ou empréstimo', natureza: 'saida', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '5909', descricao: 'Retorno de bem recebido por conta de contrato de comodato ou empréstimo', natureza: 'saida', tipo_operacao: 'retorno', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '5910', descricao: 'Remessa em bonificação, doação ou brinde', natureza: 'saida', tipo_operacao: 'bonificacao', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '5949', descricao: 'Outra saída de mercadoria ou prestação de serviço não especificada', natureza: 'saida', tipo_operacao: 'outras', gera_financeiro: false, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },

      // === SAÍDAS PARA OUTROS ESTADOS (6xxx) ===
      { codigo: '6101', descricao: 'Venda de produção do estabelecimento', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '6102', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '6108', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros, destinada a não contribuinte', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '6151', descricao: 'Transferência de produção do estabelecimento', natureza: 'saida', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '6152', descricao: 'Transferência de mercadoria adquirida ou recebida de terceiros', natureza: 'saida', tipo_operacao: 'transferencia', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '6201', descricao: 'Devolução de compra para industrialização ou produção rural', natureza: 'saida', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '6202', descricao: 'Devolução de compra para comercialização', natureza: 'saida', tipo_operacao: 'devolucao', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '6551', descricao: 'Venda de bem do ativo imobilizado', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '6908', descricao: 'Remessa de bem por conta de contrato de comodato ou empréstimo', natureza: 'saida', tipo_operacao: 'remessa', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '6909', descricao: 'Retorno de bem recebido por conta de contrato de comodato ou empréstimo', natureza: 'saida', tipo_operacao: 'retorno', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '6910', descricao: 'Remessa em bonificação, doação ou brinde', natureza: 'saida', tipo_operacao: 'bonificacao', gera_financeiro: false, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: true, aplicacao_pis_cofins: false },
      { codigo: '6949', descricao: 'Outra saída de mercadoria ou prestação de serviço não especificada', natureza: 'saida', tipo_operacao: 'outras', gera_financeiro: false, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },

      // === ENTRADAS DO EXTERIOR (3xxx) ===
      { codigo: '3101', descricao: 'Compra para industrialização ou produção rural', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '3102', descricao: 'Compra para comercialização', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },
      { codigo: '3551', descricao: 'Compra de bem para o ativo imobilizado', natureza: 'entrada', tipo_operacao: 'compra', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: true, aplicacao_icms: true, aplicacao_pis_cofins: true },

      // === SAÍDAS PARA O EXTERIOR (7xxx) ===
      { codigo: '7101', descricao: 'Venda de produção do estabelecimento', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '7102', descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: true, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
      { codigo: '7551', descricao: 'Venda de bem do ativo imobilizado', natureza: 'saida', tipo_operacao: 'venda', gera_financeiro: true, movimenta_estoque: false, aplicacao_ipi: false, aplicacao_icms: false, aplicacao_pis_cofins: false },
    ]

    const now = new Date()
    const records = cfops.map(cfop => ({
      ...cfop,
      ativo: true,
      createdAt: now,
      updatedAt: now,
    }))

    // Idempotente: verificar existência antes de inserir
    for (const record of records) {
      const existing = await queryInterface.sequelize.query(
        `SELECT id FROM C051_cfop WHERE codigo = '${record.codigo}' LIMIT 1`,
        { type: (queryInterface.sequelize as any).constructor.QueryTypes.SELECT }
      ) as any[]

      if (!existing || existing.length === 0) {
        await queryInterface.bulkInsert('C051_cfop', [record])
      }
    }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.bulkDelete('C051_cfop', {})
}
