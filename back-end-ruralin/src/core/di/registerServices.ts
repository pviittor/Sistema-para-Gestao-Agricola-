/**
 * Registro de Services no Container de DI
 * 
 * Este arquivo registra todos os services no container de DI
 * usando os tokens definidos em TYPES.
 * 
 * IMPORTANTE: Este arquivo deve ser importado antes de chamar initializeContainer()
 * para garantir que os services estejam registrados.
 */

import { container } from './container';
import { TYPES } from './types';

// Importar services
import { LoggerService } from '../logger/LoggerService';
import { UsuarioApplicationService } from '../../application/services/usuario/UsuarioApplicationService';
import { EventoApplicationService } from '../../application/services/evento/EventoApplicationService';
import { FinanceiroApplicationService } from '../../application/services/financeiro/FinanceiroApplicationService';
import { LembreteApplicationService } from '../../application/services/lembrete/LembreteApplicationService';
import { LocalApplicationService } from '../../application/services/local/LocalApplicationService';
import { RoleApplicationService } from '../../application/services/role/RoleApplicationService';
import { PermissaoApplicationService } from '../../application/services/permissao/PermissaoApplicationService';
import { PessoaApplicationService } from '../../application/services/pessoa/PessoaApplicationService';
import { GrupoProdutoApplicationService } from '../../application/services/grupoProduto/GrupoProdutoApplicationService';
import { GrupoProdutoMapper } from '../../application/mappers/GrupoProdutoMapper';
import { SubGrupoProdutoApplicationService } from '../../application/services/subGrupoProduto/SubGrupoProdutoApplicationService';
import { SubGrupoProdutoMapper } from '../../application/mappers/SubGrupoProdutoMapper';
import { PrincipioAtivoApplicationService } from '../../application/services/principioAtivo/PrincipioAtivoApplicationService';
import { PrincipioAtivoMapper } from '../../application/mappers/PrincipioAtivoMapper';
import { UnidadeMedidaApplicationService } from '../../application/services/unidadeMedida/UnidadeMedidaApplicationService';
import { UnidadeMedidaMapper } from '../../application/mappers/UnidadeMedidaMapper';
import { MoedaApplicationService } from '../../application/services/moeda/MoedaApplicationService';
import { MoedaMapper } from '../../application/mappers/MoedaMapper';
import { MoedaCotacaoApplicationService } from '../../application/services/moedaCotacao/MoedaCotacaoApplicationService';
import { MoedaCotacaoMapper } from '../../application/mappers/MoedaCotacaoMapper';
import { ProdutoApplicationService } from '../../application/services/produto/ProdutoApplicationService';
import { ProdutoMapper } from '../../application/mappers/ProdutoMapper';
import { CulturaApplicationService } from '../../application/services/cultura/CulturaApplicationService';
import { CulturaMapper } from '../../application/mappers/CulturaMapper';
import { ServicoAgricolaApplicationService } from '../../application/services/servicoAgricola/ServicoAgricolaApplicationService';
import { ServicoAgricolaMapper } from '../../application/mappers/ServicoAgricolaMapper';
import { PlanoContaGerencialApplicationService } from '../../application/services/planoContaGerencial/PlanoContaGerencialApplicationService';
import { PlanoContaGerencialMapper } from '../../application/mappers/PlanoContaGerencialMapper';
import { ConsultoriaApplicationService } from '../../application/services/consultoria/ConsultoriaApplicationService';
import { ConsultoriaMapper } from '../../application/mappers/ConsultoriaMapper';
import { EstadoApplicationService } from '../../application/services/estado/EstadoApplicationService';
import { EstadoMapper } from '../../application/mappers/EstadoMapper';
import { MunicipioApplicationService } from '../../application/services/municipio/MunicipioApplicationService';
import { MunicipioMapper } from '../../application/mappers/MunicipioMapper';
import { CentroCustoApplicationService } from '../../application/services/centroCusto/CentroCustoApplicationService';
import { CentroCustoMapper } from '../../application/mappers/CentroCustoMapper';
import { SafraApplicationService } from '../../application/services/safra/SafraApplicationService';
import { SafraMapper } from '../../application/mappers/SafraMapper';
import { FazendaApplicationService } from '../../application/services/fazenda/FazendaApplicationService';
import { FazendaMapper } from '../../application/mappers/FazendaMapper';
import { TituloPagarApplicationService } from '../../application/services/tituloPagar/TituloPagarApplicationService';
import { TituloPagarMapper } from '../../application/mappers/TituloPagarMapper';
import { TituloReceberApplicationService } from '../../application/services/tituloReceber/TituloReceberApplicationService';
import { TituloReceberMapper } from '../../application/mappers/TituloReceberMapper';
import { ParcelaApplicationService } from '../../application/services/parcela/ParcelaApplicationService';
import { RelatorioFinanceiroApplicationService } from '../../application/services/relatorioFinanceiro/RelatorioFinanceiroApplicationService';
import { MoedaConversionService } from '../../application/services/moedaConversion/MoedaConversionService';
import { ContaApplicationService } from '../../application/services/conta/ContaApplicationService';
import { ContaMapper } from '../../application/mappers/ContaMapper';
import { GrupoEquipamentoApplicationService } from '../../application/services/grupoEquipamento/GrupoEquipamentoApplicationService';
import { GrupoEquipamentoMapper } from '../../application/mappers/GrupoEquipamentoMapper';
import { MaquinaApplicationService } from '../../application/services/maquina/MaquinaApplicationService';
import { MaquinaMapper } from '../../application/mappers/MaquinaMapper';
import { AbastecimentoApplicationService } from '../../application/services/abastecimento/AbastecimentoApplicationService';
import { AbastecimentoMapper } from '../../application/mappers/AbastecimentoMapper';
import { MovimentoEstoqueApplicationService } from '../../application/services/movimentoEstoque/MovimentoEstoqueApplicationService';
import { MovimentoEstoqueMapper } from '../../application/mappers/MovimentoEstoqueMapper';
import { HistoricoPrecoMapper } from '../../application/mappers/HistoricoPrecoMapper';
import { TalhaoApplicationService } from '../../application/services/talhao/TalhaoApplicationService';
import { TalhaoMapper } from '../../application/mappers/TalhaoMapper';
import { NdviService } from '../../application/services/ndvi/NdviService';
import { ConfiguradorCicloApplicationService } from '../../application/services/configuradorCiclo/ConfiguradorCicloApplicationService';
import { ConfiguradorCicloMapper } from '../../application/mappers/ConfiguradorCicloMapper';
import { AtividadeAgricolaApplicationService } from '../../application/services/atividadeAgricola/AtividadeAgricolaApplicationService';
import { AtividadeAgricolaMapper } from '../../application/mappers/AtividadeAgricolaMapper';
import { AtividadeOperacaoApplicationService } from '../../application/services/atividadeOperacao/AtividadeOperacaoApplicationService';
import { AtividadeOperacaoMapper } from '../../application/mappers/AtividadeOperacaoMapper';
import { ApontamentoApplicationService } from '../../application/services/apontamento/ApontamentoApplicationService';
import { ApontamentoMapper } from '../../application/mappers/ApontamentoMapper';
import { ApontamentoMaquinasApplicationService } from '../../application/services/apontamentoMaquinas/ApontamentoMaquinasApplicationService';
import { ApontamentoMaquinasMapper } from '../../application/mappers/ApontamentoMaquinasMapper';
import { ApontamentoProdutoApplicationService } from '../../application/services/apontamentoProduto/ApontamentoProdutoApplicationService';
import { ApontamentoProdutoMapper } from '../../application/mappers/ApontamentoProdutoMapper';
import { ApontamentoServicoApplicationService } from '../../application/services/apontamentoServico/ApontamentoServicoApplicationService';
import { ApontamentoServicoMapper } from '../../application/mappers/ApontamentoServicoMapper';
import { BenfeitoriaApplicationService } from '../../application/services/benfeitoria/BenfeitoriaApplicationService';
import { BenfeitoriaMapper } from '../../application/mappers/BenfeitoriaMapper';
import { ProdutoBenfeitoriaApplicationService } from '../../application/services/produtoBenfeitoria/ProdutoBenfeitoriaApplicationService';
import { ProdutoBenfeitoriaMapper } from '../../application/mappers/ProdutoBenfeitoriaMapper';
import { ServicoBenfeitoriaApplicationService } from '../../application/services/servicoBenfeitoria/ServicoBenfeitoriaApplicationService';
import { ServicoBenfeitoriaMapper } from '../../application/mappers/ServicoBenfeitoriaMapper';
import { ListaBancosApplicationService } from '../../application/services/listaBancos/ListaBancosApplicationService';
import { ListaBancosMapper } from '../../application/mappers/ListaBancosMapper';
import { NotaFiscalApplicationService } from '../../application/services/notaFiscal/NotaFiscalApplicationService';
import { NotaFiscalMapper } from '../../application/mappers/NotaFiscalMapper';
import { ItemNotaFiscalApplicationService } from '../../application/services/itemNotaFiscal/ItemNotaFiscalApplicationService';
import { ItemNotaFiscalMapper } from '../../application/mappers/ItemNotaFiscalMapper';
import { PedidoCompraApplicationService } from '../../application/services/pedidoCompra/PedidoCompraApplicationService';
import { PedidoCompraMapper } from '../../application/mappers/PedidoCompraMapper';
import { ItemPedidoCompraApplicationService } from '../../application/services/itemPedidoCompra/ItemPedidoCompraApplicationService';
import { ItemPedidoCompraMapper } from '../../application/mappers/ItemPedidoCompraMapper';
import { BaixaPedidoCompraApplicationService } from '../../application/services/baixaPedidoCompra/BaixaPedidoCompraApplicationService';
import { BaixaPedidoCompraMapper } from '../../application/mappers/BaixaPedidoCompraMapper';
import { ItemBaixaPedidoCompraApplicationService } from '../../application/services/itemBaixaPedidoCompra/ItemBaixaPedidoCompraApplicationService';
import { ItemBaixaPedidoCompraMapper } from '../../application/mappers/ItemBaixaPedidoCompraMapper';
import { EmprestimoApplicationService } from '../../application/services/emprestimo/EmprestimoApplicationService';
import { EmprestimoMapper } from '../../application/mappers/EmprestimoMapper';
import { EmprestimoItemApplicationService } from '../../application/services/emprestimoItem/EmprestimoItemApplicationService';
import { EmprestimoItemMapper } from '../../application/mappers/EmprestimoItemMapper';
import { EmprestimoItemDevolucaoApplicationService } from '../../application/services/emprestimoItemDevolucao/EmprestimoItemDevolucaoApplicationService';
import { EmprestimoItemDevolucaoMapper } from '../../application/mappers/EmprestimoItemDevolucaoMapper';
import { OutraDespesaReceitaApplicationService } from '../../application/services/outra-despesa-receita/OutraDespesaReceitaApplicationService';
import { OutraDespesaReceitaMapper } from '../../application/mappers/OutraDespesaReceitaMapper';
import { UnidadeDepositoApplicationService } from '../../application/services/unidadeDeposito/UnidadeDepositoApplicationService';
import { UnidadeDepositoMapper } from '../../application/mappers/UnidadeDepositoMapper';
import { RegistroArmazenagemApplicationService } from '../../application/services/registroArmazenagem/RegistroArmazenagemApplicationService';
import { RegistroArmazenagemMapper } from '../../application/mappers/RegistroArmazenagemMapper';
import { AgreementApplicationService } from '../../application/services/agreement/AgreementApplicationService';
import { AgreementMapper } from '../../application/mappers/AgreementMapper';
import { RecorrenciaFinanceiraApplicationService } from '../../application/services/recorrenciaFinanceira/RecorrenciaFinanceiraApplicationService';
import { RecorrenciaFinanceiraMapper } from '../../application/mappers/RecorrenciaFinanceiraMapper';
import { LancamentoRecorrenteMapper } from '../../application/mappers/LancamentoRecorrenteMapper';
import { AlertaVencimentoConfigApplicationService } from '../../application/services/alertaVencimentoConfig/AlertaVencimentoConfigApplicationService';
import { AlertaVencimentoConfigMapper } from '../../application/mappers/AlertaVencimentoConfigMapper';
import { AlertaVencimentoMapper } from '../../application/mappers/AlertaVencimentoMapper';
import { ParcelamentoService } from '../../application/services/parcelamento/ParcelamentoService';
import { AgingReportService } from '../../application/services/aging/AgingReportService';
import { FluxoCaixaCalculadorService } from '../../application/services/fluxoCaixa/FluxoCaixaCalculadorService';
import { FluxoCaixaConfiguracaoApplicationService } from '../../application/services/fluxoCaixaConfiguracao/FluxoCaixaConfiguracaoApplicationService';
import { FluxoCaixaConfiguracaoMapper } from '../../application/mappers/FluxoCaixaConfiguracaoMapper';
import { FluxoCaixaSimulacaoApplicationService } from '../../application/services/fluxoCaixaSimulacao/FluxoCaixaSimulacaoApplicationService';
import { FluxoCaixaSimulacaoMapper } from '../../application/mappers/FluxoCaixaSimulacaoMapper';
import { NumeracaoReciboApplicationService } from '../../application/services/numeracaoRecibo/NumeracaoReciboApplicationService';
import { NumeracaoReciboMapper } from '../../application/mappers/NumeracaoReciboMapper';
import { ConfiguracaoReciboApplicationService } from '../../application/services/configuracaoRecibo/ConfiguracaoReciboApplicationService';
import { ConfiguracaoReciboMapper } from '../../application/mappers/ConfiguracaoReciboMapper';
import { ReciboApplicationService } from '../../application/services/recibo/ReciboApplicationService';
import { ReciboMapper } from '../../application/mappers/ReciboMapper';
import { ReciboPdfService } from '../../application/services/recibo/ReciboPdfService';
import { TipoAtividadeOSApplicationService } from '../../application/services/tipoAtividadeOS/TipoAtividadeOSApplicationService';
import { TipoAtividadeOSMapper } from '../../application/mappers/TipoAtividadeOSMapper';
import { OrdemServicoApplicationService } from '../../application/services/ordemServico/OrdemServicoApplicationService';
import { OrdemServicoMapper } from '../../application/mappers/OrdemServicoMapper';
import { CfopApplicationService } from '../../application/services/cfop/CfopApplicationService';
import { CfopMapper } from '../../application/mappers/CfopMapper';
import { CertificadoDigitalApplicationService } from '../../application/services/certificado-digital/CertificadoDigitalApplicationService';
import { CertificadoDigitalMapper } from '../../application/mappers/CertificadoDigitalMapper';
import { NfeXmlParserService } from '../../application/services/nfe/NfeXmlParserService';
import { NfeSefazService } from '../../application/services/nfe/NfeSefazService';
import { IntegracaoFinanceiraService } from '../../application/services/integracao/IntegracaoFinanceiraService';
import { CotacaoApplicationService } from '../../application/services/cotacao/CotacaoApplicationService';
import { CotacaoMapper } from '../../application/mappers/CotacaoMapper';
import { NumeracaoNfeApplicationService } from '../../application/services/numeracaoNfe/NumeracaoNfeApplicationService';
import { NumeracaoNfeMapper } from '../../application/mappers/NumeracaoNfeMapper';
import { NfeXmlGeneratorService } from '../../application/services/nfe/NfeXmlGeneratorService';
import { NfeAssinaturaService } from '../../application/services/nfe/NfeAssinaturaService';
import { IntegracaoEstoqueService } from '../../application/services/integracao/IntegracaoEstoqueService';
import { UnitOfWorkService } from '../unitofwork/UnitOfWorkService';
import { AuthorizationService } from '../../application/services/AuthorizationService';
import { InMemoryCacheService } from '../../infrastructure/cache/InMemoryCacheService';
import { RedisCacheService } from '../../infrastructure/cache/RedisCacheService';
import { AuditService } from '../../application/services/AuditService';
import { AuditLogQueryService } from '../../application/services/auditLog/AuditLogQueryService';
import { AuditLogCleanupService } from '../../application/services/auditLog/AuditLogCleanupService';
import { CacheInvalidationService } from '../cache/CacheInvalidationService';
import { CacheSyncService } from '../../infrastructure/cache/CacheSyncService';
import { CacheMetricsService } from '../cache/CacheMetricsService';
import { TenantService } from '../tenant/TenantService';
import { TenantActivationService } from '../tenant/TenantActivationService';
import { TenantApplicationService } from '../../application/services/tenant/TenantApplicationService';
import { TenantMapper } from '../../application/mappers/TenantMapper';

/**
 * Registra todos os services no container de DI
 * 
 * Esta função deve ser chamada antes de initializeContainer()
 * ou dentro de initializeContainer() se importada lá.
 */
export function registerServices(): void {
  // Registrar Logger Service
  container.registerSingleton(TYPES.ILogger, LoggerService);
  
  // Registrar Unit of Work Service
  container.registerSingleton(TYPES.IUnitOfWork, UnitOfWorkService);
  
  // Registrar Cache Service
  // Usar Redis em produção se configurado, senão usar InMemory
  const useRedis = process.env.USE_REDIS === 'true' || process.env.REDIS_URL !== undefined;
  if (useRedis) {
    container.registerSingleton(TYPES.ICacheService, RedisCacheService);
    console.log('Cache Service: Redis');
  } else {
    container.registerSingleton(TYPES.ICacheService, InMemoryCacheService);
    console.log('Cache Service: InMemory (development)');
  }
  
  // Registrar Authorization Service
  container.registerSingleton(TYPES.IAuthorizationService, AuthorizationService);
  
  // Registrar Audit Service
  container.registerSingleton(TYPES.IAuditService, AuditService);
  
  // Registrar AuditLog Query Service
  container.registerSingleton(TYPES.IAuditLogQueryService, AuditLogQueryService);
  
  // Registrar AuditLog Cleanup Service
  container.registerSingleton(TYPES.IAuditLogCleanupService, AuditLogCleanupService);
  
  // Registrar Cache Invalidation Service
  container.registerSingleton(TYPES.ICacheInvalidationService, CacheInvalidationService);
  
  // Registrar Cache Metrics Service
  container.registerSingleton(TYPES.ICacheMetricsService, CacheMetricsService);
  console.log('Cache Metrics Service: Enabled');
  
  // Registrar Tenant Service
  container.registerSingleton(TYPES.ITenantService, TenantService);
  console.log('Tenant Service: Registered');
  
  // Registrar Tenant Activation Service
  container.registerSingleton(TYPES.ITenantActivationService, TenantActivationService);
  console.log('Tenant Activation Service: Registered');
  
  // Registrar Cache Sync Service (apenas se Redis estiver configurado)
  if (useRedis) {
    container.registerSingleton(TYPES.ICacheSyncService, CacheSyncService);
    console.log('Cache Sync Service: Enabled (Redis Pub/Sub)');
  } else {
    console.log('Cache Sync Service: Disabled (Redis not configured)');
  }
  
  // Registrar NDVI Service
  container.registerSingleton(TYPES.INdviService, NdviService);

  // Registrar Application Services
  container.registerSingleton(TYPES.IUsuarioApplicationService, UsuarioApplicationService);
  container.registerSingleton(TYPES.IEventoApplicationService, EventoApplicationService);
  container.registerSingleton(TYPES.IFinanceiroApplicationService, FinanceiroApplicationService);
  container.registerSingleton(TYPES.ILembreteApplicationService, LembreteApplicationService);
  container.registerSingleton(TYPES.ILocalApplicationService, LocalApplicationService);
  container.registerSingleton(TYPES.IRoleApplicationService, RoleApplicationService);
  container.registerSingleton(TYPES.IPermissaoApplicationService, PermissaoApplicationService);
  container.registerSingleton(TYPES.IPessoaApplicationService, PessoaApplicationService);
  container.registerSingleton(TYPES.IGrupoProdutoApplicationService, GrupoProdutoApplicationService);
  container.registerSingleton(TYPES.ISubGrupoProdutoApplicationService, SubGrupoProdutoApplicationService);
  container.registerSingleton(TYPES.IPrincipioAtivoApplicationService, PrincipioAtivoApplicationService);
  container.registerSingleton(TYPES.IUnidadeMedidaApplicationService, UnidadeMedidaApplicationService);
  container.registerSingleton(TYPES.IMoedaApplicationService, MoedaApplicationService);
  container.registerSingleton(TYPES.IMoedaCotacaoApplicationService, MoedaCotacaoApplicationService);
  container.registerSingleton(TYPES.IProdutoApplicationService, ProdutoApplicationService);
  container.registerSingleton(TYPES.ICulturaApplicationService, CulturaApplicationService);
  container.registerSingleton(TYPES.IServicoAgricolaApplicationService, ServicoAgricolaApplicationService);
  container.registerSingleton(TYPES.IPlanoContaGerencialApplicationService, PlanoContaGerencialApplicationService);
  container.registerSingleton(TYPES.IConsultoriaApplicationService, ConsultoriaApplicationService);
  container.registerSingleton(TYPES.ITenantApplicationService, TenantApplicationService);
  container.registerSingleton(TYPES.IEstadoApplicationService, EstadoApplicationService);
  container.registerSingleton(TYPES.IMunicipioApplicationService, MunicipioApplicationService);
  container.registerSingleton(TYPES.ICentroCustoApplicationService, CentroCustoApplicationService);
  container.registerSingleton(TYPES.ISafraApplicationService, SafraApplicationService);
  container.registerSingleton(TYPES.IFazendaApplicationService, FazendaApplicationService);
  container.registerSingleton(TYPES.ITituloPagarApplicationService, TituloPagarApplicationService);
  container.registerSingleton(TYPES.ITituloReceberApplicationService, TituloReceberApplicationService);
  container.registerSingleton(TYPES.IParcelaApplicationService, ParcelaApplicationService);
  container.registerSingleton(TYPES.IRelatorioFinanceiroApplicationService, RelatorioFinanceiroApplicationService);
  container.registerSingleton(TYPES.IMoedaConversionService, MoedaConversionService);
  container.registerSingleton(TYPES.IContaApplicationService, ContaApplicationService);
  container.registerSingleton(TYPES.IGrupoEquipamentoApplicationService, GrupoEquipamentoApplicationService);
  container.registerSingleton(TYPES.IMaquinaApplicationService, MaquinaApplicationService);
  container.registerSingleton(TYPES.IAbastecimentoApplicationService, AbastecimentoApplicationService);
  container.registerSingleton(TYPES.IMovimentoEstoqueApplicationService, MovimentoEstoqueApplicationService);
  container.registerSingleton(TYPES.ITalhaoApplicationService, TalhaoApplicationService);
  container.registerSingleton(TYPES.IConfiguradorCicloApplicationService, ConfiguradorCicloApplicationService);
  container.registerSingleton(TYPES.IAtividadeAgricolaApplicationService, AtividadeAgricolaApplicationService);
  container.registerSingleton(TYPES.IAtividadeOperacaoApplicationService, AtividadeOperacaoApplicationService);
  container.registerSingleton(TYPES.IApontamentoApplicationService, ApontamentoApplicationService);
  container.registerSingleton(TYPES.IApontamentoMaquinasApplicationService, ApontamentoMaquinasApplicationService);
  container.registerSingleton(TYPES.IApontamentoProdutoApplicationService, ApontamentoProdutoApplicationService);
  container.registerSingleton(TYPES.IApontamentoServicoApplicationService, ApontamentoServicoApplicationService);
  container.registerSingleton(TYPES.IBenfeitoriaApplicationService, BenfeitoriaApplicationService);
  container.registerSingleton(TYPES.IProdutoBenfeitoriaApplicationService, ProdutoBenfeitoriaApplicationService);
  container.registerSingleton(TYPES.IServicoBenfeitoriaApplicationService, ServicoBenfeitoriaApplicationService);
  container.registerSingleton(TYPES.IListaBancosApplicationService, ListaBancosApplicationService);
  container.registerSingleton(TYPES.INotaFiscalApplicationService, NotaFiscalApplicationService);
  container.registerSingleton(TYPES.IItemNotaFiscalApplicationService, ItemNotaFiscalApplicationService);
  container.registerSingleton(TYPES.IPedidoCompraApplicationService, PedidoCompraApplicationService);
  container.registerSingleton(TYPES.IItemPedidoCompraApplicationService, ItemPedidoCompraApplicationService);
  container.registerSingleton(TYPES.IBaixaPedidoCompraApplicationService, BaixaPedidoCompraApplicationService);
  container.registerSingleton(TYPES.IItemBaixaPedidoCompraApplicationService, ItemBaixaPedidoCompraApplicationService);
  container.registerSingleton(TYPES.IEmprestimoApplicationService, EmprestimoApplicationService);
  container.registerSingleton(TYPES.IEmprestimoItemApplicationService, EmprestimoItemApplicationService);
  container.registerSingleton(TYPES.IEmprestimoItemDevolucaoApplicationService, EmprestimoItemDevolucaoApplicationService);
  container.registerSingleton(TYPES.IOutraDespesaReceitaApplicationService, OutraDespesaReceitaApplicationService);
  container.registerSingleton(TYPES.IUnidadeDepositoApplicationService, UnidadeDepositoApplicationService);
  container.registerSingleton(TYPES.IRegistroArmazenagemApplicationService, RegistroArmazenagemApplicationService);
  container.registerSingleton(TYPES.IAgreementApplicationService, AgreementApplicationService);
  container.registerSingleton(TYPES.IRecorrenciaFinanceiraApplicationService, RecorrenciaFinanceiraApplicationService);
  container.registerSingleton(TYPES.IAlertaVencimentoConfigApplicationService, AlertaVencimentoConfigApplicationService);
  container.registerSingleton(TYPES.IParcelamentoService, ParcelamentoService);
  container.registerSingleton(TYPES.IAgingReportService, AgingReportService);

  // Registrar Mappers
  container.registerSingleton(GrupoProdutoMapper, GrupoProdutoMapper);
  container.registerSingleton(SubGrupoProdutoMapper, SubGrupoProdutoMapper);
  container.registerSingleton(PrincipioAtivoMapper, PrincipioAtivoMapper);
  container.registerSingleton(UnidadeMedidaMapper, UnidadeMedidaMapper);
  container.registerSingleton(MoedaMapper, MoedaMapper);
  container.registerSingleton(MoedaCotacaoMapper, MoedaCotacaoMapper);
  container.registerSingleton(ProdutoMapper, ProdutoMapper);
  container.registerSingleton(CulturaMapper, CulturaMapper);
  container.registerSingleton(ServicoAgricolaMapper, ServicoAgricolaMapper);
  container.registerSingleton(PlanoContaGerencialMapper, PlanoContaGerencialMapper);
  container.registerSingleton(ConsultoriaMapper, ConsultoriaMapper);
  container.registerSingleton(TenantMapper, TenantMapper);
  container.registerSingleton(EstadoMapper, EstadoMapper);
  container.registerSingleton(MunicipioMapper, MunicipioMapper);
  container.registerSingleton(CentroCustoMapper, CentroCustoMapper);
  container.registerSingleton(SafraMapper, SafraMapper);
  container.registerSingleton(FazendaMapper, FazendaMapper);
  container.registerSingleton(TituloPagarMapper, TituloPagarMapper);
  container.registerSingleton(TituloReceberMapper, TituloReceberMapper);
  container.registerSingleton(ContaMapper, ContaMapper);
  container.registerSingleton(GrupoEquipamentoMapper, GrupoEquipamentoMapper);
  container.registerSingleton(MaquinaMapper, MaquinaMapper);
  container.registerSingleton(AbastecimentoMapper, AbastecimentoMapper);
  container.registerSingleton(MovimentoEstoqueMapper, MovimentoEstoqueMapper);
  container.registerSingleton(HistoricoPrecoMapper, HistoricoPrecoMapper);
  container.registerSingleton(TalhaoMapper, TalhaoMapper);
  container.registerSingleton(ConfiguradorCicloMapper, ConfiguradorCicloMapper);
  container.registerSingleton(AtividadeAgricolaMapper, AtividadeAgricolaMapper);
  container.registerSingleton(AtividadeOperacaoMapper, AtividadeOperacaoMapper);
  container.registerSingleton(ApontamentoMapper, ApontamentoMapper);
  container.registerSingleton(ApontamentoMaquinasMapper, ApontamentoMaquinasMapper);
  container.registerSingleton(ApontamentoProdutoMapper, ApontamentoProdutoMapper);
  container.registerSingleton(ApontamentoServicoMapper, ApontamentoServicoMapper);
  container.registerSingleton(BenfeitoriaMapper, BenfeitoriaMapper);
  container.registerSingleton(ProdutoBenfeitoriaMapper, ProdutoBenfeitoriaMapper);
  container.registerSingleton(ServicoBenfeitoriaMapper, ServicoBenfeitoriaMapper);
  container.registerSingleton(ListaBancosMapper, ListaBancosMapper);
  container.registerSingleton(NotaFiscalMapper, NotaFiscalMapper);
  container.registerSingleton(ItemNotaFiscalMapper, ItemNotaFiscalMapper);
  container.registerSingleton(PedidoCompraMapper, PedidoCompraMapper);
  container.registerSingleton(ItemPedidoCompraMapper, ItemPedidoCompraMapper);
  container.registerSingleton(BaixaPedidoCompraMapper, BaixaPedidoCompraMapper);
  container.registerSingleton(ItemBaixaPedidoCompraMapper, ItemBaixaPedidoCompraMapper);
  container.registerSingleton(EmprestimoMapper, EmprestimoMapper);
  container.registerSingleton(EmprestimoItemMapper, EmprestimoItemMapper);
  container.registerSingleton(EmprestimoItemDevolucaoMapper, EmprestimoItemDevolucaoMapper);
  container.registerSingleton(OutraDespesaReceitaMapper, OutraDespesaReceitaMapper);
  container.registerSingleton(UnidadeDepositoMapper, UnidadeDepositoMapper);
  container.registerSingleton(RegistroArmazenagemMapper, RegistroArmazenagemMapper);
  container.registerSingleton(AgreementMapper, AgreementMapper);
  container.registerSingleton(RecorrenciaFinanceiraMapper, RecorrenciaFinanceiraMapper);
  container.registerSingleton(LancamentoRecorrenteMapper, LancamentoRecorrenteMapper);
  container.registerSingleton(AlertaVencimentoConfigMapper, AlertaVencimentoConfigMapper);
  container.registerSingleton(AlertaVencimentoMapper, AlertaVencimentoMapper);
  container.registerSingleton(TYPES.IFluxoCaixaCalculadorService, FluxoCaixaCalculadorService);
  container.registerSingleton(TYPES.IFluxoCaixaConfiguracaoApplicationService, FluxoCaixaConfiguracaoApplicationService);
  container.registerSingleton(FluxoCaixaConfiguracaoMapper, FluxoCaixaConfiguracaoMapper);
  container.registerSingleton(TYPES.IFluxoCaixaSimulacaoApplicationService, FluxoCaixaSimulacaoApplicationService);
  container.registerSingleton(FluxoCaixaSimulacaoMapper, FluxoCaixaSimulacaoMapper);
  // NumeracaoRecibo
  container.registerSingleton(TYPES.INumeracaoReciboApplicationService, NumeracaoReciboApplicationService);
  container.registerSingleton(NumeracaoReciboMapper, NumeracaoReciboMapper);
  // ConfiguracaoRecibo
  container.registerSingleton(TYPES.IConfiguracaoReciboApplicationService, ConfiguracaoReciboApplicationService);
  container.registerSingleton(ConfiguracaoReciboMapper, ConfiguracaoReciboMapper);
  // Recibo
  container.registerSingleton(TYPES.IReciboApplicationService, ReciboApplicationService);
  container.registerSingleton(ReciboMapper, ReciboMapper);
  container.registerSingleton(TYPES.IReciboPdfService, ReciboPdfService);
  // TipoAtividadeOS
  container.registerSingleton(TYPES.ITipoAtividadeOSApplicationService, TipoAtividadeOSApplicationService);
  container.registerSingleton(TipoAtividadeOSMapper, TipoAtividadeOSMapper);
  // OrdemServico
  container.registerSingleton(TYPES.IOrdemServicoApplicationService, OrdemServicoApplicationService);
  container.registerSingleton(OrdemServicoMapper, OrdemServicoMapper);
  // Registrar CfopApplicationService e Mapper
  container.registerSingleton(TYPES.ICfopApplicationService, CfopApplicationService);
  container.registerSingleton(CfopMapper, CfopMapper);
  // Registrar CertificadoDigitalApplicationService e Mapper
  container.registerSingleton(TYPES.ICertificadoDigitalApplicationService, CertificadoDigitalApplicationService);
  container.registerSingleton(CertificadoDigitalMapper, CertificadoDigitalMapper);
  // Registrar NfeXmlParserService, NfeSefazService e IntegracaoFinanceiraService
  container.registerSingleton(TYPES.INfeXmlParserService, NfeXmlParserService);
  container.registerSingleton(TYPES.INfeSefazService, NfeSefazService);
  container.registerSingleton(TYPES.IIntegracaoFinanceiraService, IntegracaoFinanceiraService);
  // Registrar CotacaoApplicationService e Mapper
  container.registerSingleton(TYPES.ICotacaoApplicationService, CotacaoApplicationService);
  container.registerSingleton(CotacaoMapper, CotacaoMapper);
  // Registrar NumeracaoNfeApplicationService e Mapper
  container.registerSingleton(TYPES.INumeracaoNfeApplicationService, NumeracaoNfeApplicationService);
  container.registerSingleton(NumeracaoNfeMapper, NumeracaoNfeMapper);
  // Registrar NfeXmlGeneratorService, NfeAssinaturaService, IntegracaoEstoqueService
  container.registerSingleton(TYPES.INfeXmlGeneratorService, NfeXmlGeneratorService);
  container.registerSingleton(TYPES.INfeAssinaturaService, NfeAssinaturaService);
  container.registerSingleton(TYPES.IIntegracaoEstoqueService, IntegracaoEstoqueService);

  console.log('Services registered in DI container');
}
