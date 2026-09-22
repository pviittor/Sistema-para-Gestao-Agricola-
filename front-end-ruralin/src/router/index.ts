import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login' },
    },
    {
      path: '/dashboard',
      component: () => import('../views/DashboardView.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/WelcomeView.vue'),
          meta: { title: 'Início' },
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/WelcomeView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'lembrete',
          name: 'lembrete',
          component: () => import('../views/LembreteView.vue'),
          meta: { title: 'Lembrete' },
        },
        {
          path: 'locais',
          name: 'locais',
          component: () => import('../views/LocaisView.vue'),
          meta: { title: 'Locais' },
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: () => import('../views/CalendarView.vue'),
          meta: { title: 'Calendário' },
        },
        {
          path: 'financeiro',
          name: 'financeiro',
          component: () => import('../views/FinanceiroView.vue'),
          meta: { title: 'Financeiro' },
        },
        {
          path: 'relatorio-financeiro',
          name: 'relatorio-financeiro',
          component: () => import('../views/RelatorioFinanceiroView.vue'),
          meta: { title: 'Relatórios Financeiros' },
        },
        {
          path: 'administrador',
          name: 'administrador',
          component: () => import('../views/AdminView.vue'),
          meta: { title: 'Administrador' },
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('../views/ContasView.vue'),
          meta: { title: 'Usuários' },
        },
        {
          path: 'parceiros',
          name: 'parceiros',
          component: () => import('../views/cadastros/ParceiroNegocioView.vue'),
          meta: { title: 'Parceiros de Negócio' },
        },
        {
          path: 'maquinas',
          name: 'maquinas',
          component: () => import('../views/cadastros/MaquinasVeiculosView.vue'),
          meta: { title: 'Máquinas e Veículos' },
        },
        {
          path: 'abastecimentos',
          name: 'abastecimentos',
          component: () => import('../views/cadastros/AbastecimentosView.vue'),
          meta: { title: 'Abastecimentos' },
        },
        {
          path: 'propriedades',
          name: 'propriedades',
          component: () => import('../views/cadastros/PropriedadesView.vue'),
          meta: { title: 'Propriedades / Fazendas' },
        },
        {
          path: 'talhoes',
          name: 'talhoes',
          component: () => import('../views/TalhoesView.vue'),
          meta: { title: 'Talhões' },
        },
        {
          path: 'culturas',
          name: 'culturas',
          component: () => import('../views/CulturasView.vue'),
          meta: { title: 'Culturas' },
        },
        {
          path: 'safras',
          name: 'safras',
          component: () => import('../views/SafrasView.vue'),
          meta: { title: 'Safras' },
        },
        {
          path: 'operacoes-campo',
          name: 'operacoes-campo',
          component: () => import('../views/OperacoesCampoView.vue'),
          meta: { title: 'Operações de Campo' },
        },
        {
          path: 'servicos',
          name: 'servicos',
          component: () => import('../views/cadastros/ServicosView.vue'),
          meta: { title: 'Serviços Agrícolas' },
        },
        {
          path: 'benfeitorias',
          name: 'benfeitorias',
          component: () => import('../views/cadastros/BenfeitoriasView.vue'),
          meta: { title: 'Benfeitorias' },
        },
        {
          path: 'produtos',
          name: 'produtos',
          component: () => import('../views/ProdutosView.vue'),
          meta: { title: 'Produtos' },
        },
        {
          path: 'pedidos-compra',
          name: 'pedidos-compra',
          component: () => import('../views/PedidosCompraView.vue'),
          meta: { title: 'Pedidos de Compra' },
        },
        {
          path: 'centros-custo',
          name: 'centros-custo',
          component: () => import('../views/CentroCustoView.vue'),
          meta: { title: 'Centros de Custo' },
        },
        {
          path: 'contas-bancarias',
          name: 'contas-bancarias',
          component: () => import('../views/ContasBancariasView.vue'),
          meta: { title: 'Contas Bancárias' },
        },
        {
          path: 'plano-conta-gerencial',
          name: 'plano-conta-gerencial',
          component: () => import('../views/PlanoContaGerencialView.vue'),
          meta: { title: 'Plano Conta Gerencial' },
        },
        {
          path: 'nf-entrada',
          name: 'nf-entrada',
          component: () => import('../views/NotaFiscalEntradaView.vue'),
          meta: { title: 'NF de Entrada' },
        },
        {
          path: 'nf-saida',
          name: 'nf-saida',
          component: () => import('../views/NotaFiscalSaidaView.vue'),
          meta: { title: 'NF de Saída' },
        },
        {
          path: 'emprestimos',
          name: 'emprestimos',
          component: () => import('../views/EmprestimoView.vue'),
          meta: { title: 'Empréstimos' },
        },
        {
          path: 'outras-despesas-receitas',
          name: 'outras-despesas-receitas',
          component: () => import('../views/cadastros/outrasDespesasReceitas/OutrasDespesasReceitasView.vue'),
          meta: { title: 'Outras Despesas e Receitas' },
        },
        {
          path: 'armazem',
          name: 'armazem',
          component: () => import('../views/cadastros/ArmazemView.vue'),
          meta: { title: 'Armazem' },
        },
        {
          path: 'agreements',
          name: 'agreements',
          component: () => import('../views/cadastros/AgreementsView.vue'),
          meta: { title: 'Acordos' },
        },
        {
          path: 'contas-pagar',
          name: 'contas-pagar',
          component: () => import('../views/ContasPagarView.vue'),
          meta: { title: 'Contas a Pagar' },
        },
        {
          path: 'contas-receber',
          name: 'contas-receber',
          component: () => import('../views/ContasReceberView.vue'),
          meta: { title: 'Contas a Receber' },
        },
        {
          path: 'aging',
          name: 'aging',
          component: () => import('../views/AgingRelatorioView.vue'),
          meta: { title: 'Relatorio de Aging' },
        },
        {
          path: 'recorrencia-financeira',
          name: 'recorrencia-financeira',
          component: () => import('../views/RecorrenciaFinanceiraView.vue'),
          meta: { title: 'Lancamentos Recorrentes' },
        },
        {
          path: 'fluxo-caixa',
          name: 'fluxo-caixa',
          component: () => import('../views/FluxoCaixaView.vue'),
          meta: { title: 'Fluxo de Caixa' },
        },
        {
          path: 'recibos',
          name: 'recibos',
          component: () => import('../views/cadastros/RecibosView.vue'),
          meta: { title: 'Recibos' },
        },
        {
          path: 'numeracao-recibos',
          name: 'numeracao-recibos',
          component: () => import('../views/cadastros/NumeracaoReciboView.vue'),
          meta: { title: 'Numeração de Recibos' },
        },
        {
          path: 'configuracao-recibos',
          name: 'configuracao-recibos',
          component: () => import('../views/cadastros/ConfiguracaoReciboView.vue'),
          meta: { title: 'Configuração de Recibos' },
        },
        {
          path: 'tipos-atividade',
          name: 'TiposAtividade',
          component: () => import('../views/cadastros/TipoAtividadeOSView.vue'),
          meta: { requiresAuth: true, title: 'Tipos de Atividade OS' },
        },
        {
          path: 'ordens-servico',
          name: 'OrdensServico',
          component: () => import('../views/cadastros/OrdensServicoView.vue'),
          meta: { requiresAuth: true, title: 'Ordens de Servico' },
        },
        {
          path: 'custeio-talhao',
          name: 'CusteioTalhao',
          component: () => import('../views/cadastros/CusteioTalhaoView.vue'),
          meta: { requiresAuth: true, title: 'Custeio por Talhao' },
        },
        {
          path: 'analytics-os',
          name: 'AnalyticsOS',
          component: () => import('../views/cadastros/AnalyticsOSView.vue'),
          meta: { requiresAuth: true, title: 'Analytics de Operacoes' },
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.name !== 'login' && !token) {
    next({ name: 'login' })
    return
  }

  if (to.name === 'login' && token) {
    next({ name: 'home' })
    return
  }

  const title = to.meta.title as string
  if (title) {
    document.title = `${title} | Rural In`
  } else {
    document.title = 'Rural In'
  }
  next()
})

export default router
