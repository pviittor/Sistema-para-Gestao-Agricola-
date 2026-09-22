/**
 * Registro de Repositories no Container de DI
 * 
 * Este arquivo registra todos os repositories no container de DI
 * usando os tokens definidos em TYPES.
 * 
 * IMPORTANTE: Este arquivo deve ser importado antes de chamar initializeContainer()
 * para garantir que os repositories estejam registrados.
 */

import { container } from './container';
import { TYPES } from './types';

// Importar repositories
import { UsuarioRepository } from '../../infrastructure/repository/UsuarioRepository';
import { EventoRepository } from '../../infrastructure/repository/EventoRepository';
import { FinanceiroRepository } from '../../infrastructure/repository/FinanceiroRepository';
import { LembreteRepository } from '../../infrastructure/repository/LembreteRepository';
import { LocalRepository } from '../../infrastructure/repository/LocalRepository';
import { RoleRepository } from '../../infrastructure/repository/RoleRepository';
import { PermissaoRepository } from '../../infrastructure/repository/PermissaoRepository';
import { AuditLogRepository } from '../../infrastructure/repository/AuditLogRepository';
import { PessoaRepository } from '../../infrastructure/repository/PessoaRepository';
import { GrupoProdutoRepository } from '../../infrastructure/repository/GrupoProdutoRepository';
import { SubGrupoProdutoRepository } from '../../infrastructure/repository/SubGrupoProdutoRepository';
import { PrincipioAtivoRepository } from '../../infrastructure/repository/PrincipioAtivoRepository';
import { UnidadeMedidaRepository } from '../../infrastructure/repository/UnidadeMedidaRepository';
import { MoedaRepository } from '../../infrastructure/repository/MoedaRepository';
import { MoedaCotacaoRepository } from '../../infrastructure/repository/MoedaCotacaoRepository';
import { ProdutoRepository } from '../../infrastructure/repository/ProdutoRepository';
import { CulturaRepository } from '../../infrastructure/repository/CulturaRepository';
import { ServicoAgricolaRepository } from '../../infrastructure/repository/ServicoAgricolaRepository';
import { PlanoContaGerencialRepository } from '../../infrastructure/repository/PlanoContaGerencialRepository';
import { ConsultoriaRepository } from '../../infrastructure/repository/ConsultoriaRepository';
import { TenantRepository } from '../../infrastructure/repository/TenantRepository';
import { EstadoRepository } from '../../infrastructure/repository/EstadoRepository';
import { MunicipioRepository } from '../../infrastructure/repository/MunicipioRepository';
import { CentroCustoRepository } from '../../infrastructure/repository/CentroCustoRepository';
import { SafraRepository } from '../../infrastructure/repository/SafraRepository';
import { FazendaRepository } from '../../infrastructure/repository/FazendaRepository';
import { TituloPagarRepository } from '../../infrastructure/repository/TituloPagarRepository';
import { TituloReceberRepository } from '../../infrastructure/repository/TituloReceberRepository';
import { ParcelaTituloPagarRepository } from '../../infrastructure/repository/ParcelaTituloPagarRepository';
import { ParcelaTituloReceberRepository } from '../../infrastructure/repository/ParcelaTituloReceberRepository';
import { RateioPlanoContaTituloPagarRepository } from '../../infrastructure/repository/RateioPlanoContaTituloPagarRepository';
import { RateioPlanoContaTituloReceberRepository } from '../../infrastructure/repository/RateioPlanoContaTituloReceberRepository';
import { RateioCentroCustoTituloPagarRepository } from '../../infrastructure/repository/RateioCentroCustoTituloPagarRepository';
import { RateioCentroCustoTituloReceberRepository } from '../../infrastructure/repository/RateioCentroCustoTituloReceberRepository';
import { MovimentoFinanceiroTituloPagarRepository } from '../../infrastructure/repository/MovimentoFinanceiroTituloPagarRepository';
import { MovimentoFinanceiroTituloReceberRepository } from '../../infrastructure/repository/MovimentoFinanceiroTituloReceberRepository';
import { ContaRepository } from '../../infrastructure/repository/ContaRepository';
import { GrupoEquipamentoRepository } from '../../infrastructure/repository/GrupoEquipamentoRepository';
import { MaquinaRepository } from '../../infrastructure/repository/MaquinaRepository';
import { AbastecimentoRepository } from '../../infrastructure/repository/AbastecimentoRepository';
import { MovimentoEstoqueRepository } from '../../infrastructure/repository/MovimentoEstoqueRepository';
import { HistoricoPrecoRepository } from '../../infrastructure/repository/HistoricoPrecoRepository';
import { TalhaoRepository } from '../../infrastructure/repository/TalhaoRepository';
import { ConfiguradorCicloRepository } from '../../infrastructure/repository/ConfiguradorCicloRepository';
import { AtividadeAgricolaRepository } from '../../infrastructure/repository/AtividadeAgricolaRepository';
import { AtividadeOperacaoRepository } from '../../infrastructure/repository/AtividadeOperacaoRepository';
import { ApontamentoRepository } from '../../infrastructure/repository/ApontamentoRepository';
import { ApontamentoMaquinasRepository } from '../../infrastructure/repository/ApontamentoMaquinasRepository';
import { ApontamentoProdutoRepository } from '../../infrastructure/repository/ApontamentoProdutoRepository';
import { ApontamentoServicoRepository } from '../../infrastructure/repository/ApontamentoServicoRepository';
import { BenfeitoriaRepository } from '../../infrastructure/repository/BenfeitoriaRepository';
import { ProdutoBenfeitoriaRepository } from '../../infrastructure/repository/ProdutoBenfeitoriaRepository';
import { ServicoBenfeitoriaRepository } from '../../infrastructure/repository/ServicoBenfeitoriaRepository';
import { ListaBancosRepository } from '../../infrastructure/repository/ListaBancosRepository';
import { NotaFiscalRepository } from '../../infrastructure/repository/NotaFiscalRepository';
import { ItemNotaFiscalRepository } from '../../infrastructure/repository/ItemNotaFiscalRepository';
import { PedidoCompraRepository } from '../../infrastructure/repository/PedidoCompraRepository';
import { ItemPedidoCompraRepository } from '../../infrastructure/repository/ItemPedidoCompraRepository';
import { BaixaPedidoCompraRepository } from '../../infrastructure/repository/BaixaPedidoCompraRepository';
import { ItemBaixaPedidoCompraRepository } from '../../infrastructure/repository/ItemBaixaPedidoCompraRepository';
import { EmprestimoRepository } from '../../infrastructure/repository/EmprestimoRepository';
import { EmprestimoItemRepository } from '../../infrastructure/repository/EmprestimoItemRepository';
import { EmprestimoItemDevolucaoRepository } from '../../infrastructure/repository/EmprestimoItemDevolucaoRepository';
import { OutraDespesaReceitaRepository } from '../../infrastructure/repository/OutraDespesaReceitaRepository';
import { UnidadeDepositoRepository } from '../../infrastructure/repository/UnidadeDepositoRepository';
import { RegistroArmazenagemRepository } from '../../infrastructure/repository/RegistroArmazenagemRepository';
import { AgreementRepository } from '../../infrastructure/repository/AgreementRepository';
import { AgreementLeaseTermRepository } from '../../infrastructure/repository/AgreementLeaseTermRepository';
import { AgreementPaymentScheduleRepository } from '../../infrastructure/repository/AgreementPaymentScheduleRepository';
import { AgreementFieldRepository } from '../../infrastructure/repository/AgreementFieldRepository';
import { RecorrenciaFinanceiraRepository } from '../../infrastructure/repository/RecorrenciaFinanceiraRepository';
import { LancamentoRecorrenteRepository } from '../../infrastructure/repository/LancamentoRecorrenteRepository';
import { AlertaVencimentoConfigRepository } from '../../infrastructure/repository/AlertaVencimentoConfigRepository';
import { AlertaVencimentoRepository } from '../../infrastructure/repository/AlertaVencimentoRepository';
import { FluxoCaixaConfiguracaoRepository } from '../../infrastructure/repository/FluxoCaixaConfiguracaoRepository';
import { FluxoCaixaSimulacaoRepository } from '../../infrastructure/repository/FluxoCaixaSimulacaoRepository';
import { FluxoCaixaSimulacaoItemRepository } from '../../infrastructure/repository/FluxoCaixaSimulacaoItemRepository';
import { NumeracaoReciboRepository } from '../../infrastructure/repository/NumeracaoReciboRepository';
import { ConfiguracaoReciboRepository } from '../../infrastructure/repository/ConfiguracaoReciboRepository';
import { ReciboRepository } from '../../infrastructure/repository/ReciboRepository';
import { TipoAtividadeOSRepository } from '../../infrastructure/repository/TipoAtividadeOSRepository';
import { CampoCondicionalTipoAtividadeRepository } from '../../infrastructure/repository/CampoCondicionalTipoAtividadeRepository';
import { OrdemServicoRepository } from '../../infrastructure/repository/OrdemServicoRepository';
import { OrdemServicoTalhaoRepository } from '../../infrastructure/repository/OrdemServicoTalhaoRepository';
import { OrdemServicoInsumoRepository } from '../../infrastructure/repository/OrdemServicoInsumoRepository';
import { OrdemServicoMaquinaRepository } from '../../infrastructure/repository/OrdemServicoMaquinaRepository';
import { OrdemServicoResponsavelRepository } from '../../infrastructure/repository/OrdemServicoResponsavelRepository';
import { CfopRepository } from '../../infrastructure/repository/CfopRepository';
import { CertificadoDigitalRepository } from '../../infrastructure/repository/CertificadoDigitalRepository';
import { CotacaoRepository } from '../../infrastructure/repository/CotacaoRepository';
import { CotacaoItemRepository } from '../../infrastructure/repository/CotacaoItemRepository';
import { NumeracaoNfeRepository } from '../../infrastructure/repository/NumeracaoNfeRepository';

/**
 * Registra todos os repositories no container de DI
 * 
 * Esta função deve ser chamada antes de initializeContainer()
 * ou dentro de initializeContainer() se importada lá.
 */
export function registerRepositories(): void {
  // Registrar UsuarioRepository
  container.registerSingleton(TYPES.IUsuarioRepository, UsuarioRepository);
  // Registrar EventoRepository
  container.registerSingleton(TYPES.IEventoRepository, EventoRepository);
  // Registrar FinanceiroRepository
  container.registerSingleton(TYPES.IFinanceiroRepository, FinanceiroRepository);
  // Registrar LembreteRepository
  container.registerSingleton(TYPES.ILembreteRepository, LembreteRepository);
  // Registrar LocalRepository
  container.registerSingleton(TYPES.ILocalRepository, LocalRepository);
  // Registrar RoleRepository
  container.registerSingleton(TYPES.IRoleRepository, RoleRepository);
  // Registrar PermissaoRepository
  container.registerSingleton(TYPES.IPermissaoRepository, PermissaoRepository);
  // Registrar AuditLogRepository
  container.registerSingleton(TYPES.IAuditLogRepository, AuditLogRepository);
  // Registrar PessoaRepository
  container.registerSingleton(TYPES.IPessoaRepository, PessoaRepository);
  // Registrar GrupoProdutoRepository
  container.registerSingleton(TYPES.IGrupoProdutoRepository, GrupoProdutoRepository);
  // Registrar SubGrupoProdutoRepository
  container.registerSingleton(TYPES.ISubGrupoProdutoRepository, SubGrupoProdutoRepository);
  // Registrar PrincipioAtivoRepository
  container.registerSingleton(TYPES.IPrincipioAtivoRepository, PrincipioAtivoRepository);
  // Registrar UnidadeMedidaRepository
  container.registerSingleton(TYPES.IUnidadeMedidaRepository, UnidadeMedidaRepository);
  // Registrar MoedaRepository
  container.registerSingleton(TYPES.IMoedaRepository, MoedaRepository);
  // Registrar ListaBancosRepository
  container.registerSingleton(TYPES.IListaBancosRepository, ListaBancosRepository);
  // Registrar MoedaCotacaoRepository
  container.registerSingleton(TYPES.IMoedaCotacaoRepository, MoedaCotacaoRepository);
  // Registrar ProdutoRepository
  container.registerSingleton(TYPES.IProdutoRepository, ProdutoRepository);
  // Registrar CulturaRepository
  container.registerSingleton(TYPES.ICulturaRepository, CulturaRepository);
  // Registrar ServicoAgricolaRepository
  container.registerSingleton(TYPES.IServicoAgricolaRepository, ServicoAgricolaRepository);
  // Registrar PlanoContaGerencialRepository
  container.registerSingleton(TYPES.IPlanoContaGerencialRepository, PlanoContaGerencialRepository);
  // Registrar ConsultoriaRepository
  container.registerSingleton(TYPES.IConsultoriaRepository, ConsultoriaRepository);
  // Registrar TenantRepository
  container.registerSingleton(TYPES.ITenantRepository, TenantRepository);
  // Registrar EstadoRepository
  container.registerSingleton(TYPES.IEstadoRepository, EstadoRepository);
  // Registrar MunicipioRepository
  container.registerSingleton(TYPES.IMunicipioRepository, MunicipioRepository);
  // Registrar CentroCustoRepository
  container.registerSingleton(TYPES.ICentroCustoRepository, CentroCustoRepository);
  // Registrar SafraRepository
  container.registerSingleton(TYPES.ISafraRepository, SafraRepository);
  // Registrar FazendaRepository
  container.registerSingleton(TYPES.IFazendaRepository, FazendaRepository);
  // Registrar TituloPagarRepository
  container.registerSingleton(TYPES.ITituloPagarRepository, TituloPagarRepository);
  // Registrar TituloReceberRepository
  container.registerSingleton(TYPES.ITituloReceberRepository, TituloReceberRepository);
  // Registrar ParcelaTituloPagarRepository
  container.registerSingleton(TYPES.IParcelaTituloPagarRepository, ParcelaTituloPagarRepository);
  // Registrar ParcelaTituloReceberRepository
  container.registerSingleton(TYPES.IParcelaTituloReceberRepository, ParcelaTituloReceberRepository);
  // Registrar RateioPlanoContaTituloPagarRepository
  container.registerSingleton(TYPES.IRateioPlanoContaTituloPagarRepository, RateioPlanoContaTituloPagarRepository);
  // Registrar RateioPlanoContaTituloReceberRepository
  container.registerSingleton(TYPES.IRateioPlanoContaTituloReceberRepository, RateioPlanoContaTituloReceberRepository);
  // Registrar RateioCentroCustoTituloPagarRepository
  container.registerSingleton(TYPES.IRateioCentroCustoTituloPagarRepository, RateioCentroCustoTituloPagarRepository);
  // Registrar RateioCentroCustoTituloReceberRepository
  container.registerSingleton(TYPES.IRateioCentroCustoTituloReceberRepository, RateioCentroCustoTituloReceberRepository);
  // Registrar MovimentoFinanceiroTituloPagarRepository
  container.registerSingleton(TYPES.IMovimentoFinanceiroTituloPagarRepository, MovimentoFinanceiroTituloPagarRepository);
  // Registrar MovimentoFinanceiroTituloReceberRepository
  container.registerSingleton(TYPES.IMovimentoFinanceiroTituloReceberRepository, MovimentoFinanceiroTituloReceberRepository);
  // Registrar ContaRepository
  container.registerSingleton(TYPES.IContaRepository, ContaRepository);
  // Registrar GrupoEquipamentoRepository
  container.registerSingleton(TYPES.IGrupoEquipamentoRepository, GrupoEquipamentoRepository);
  // Registrar MaquinaRepository
  container.registerSingleton(TYPES.IMaquinaRepository, MaquinaRepository);
  // Registrar AbastecimentoRepository
  container.registerSingleton(TYPES.IAbastecimentoRepository, AbastecimentoRepository);
  // Registrar MovimentoEstoqueRepository
  container.registerSingleton(TYPES.IMovimentoEstoqueRepository, MovimentoEstoqueRepository);
  // Registrar HistoricoPrecoRepository
  container.registerSingleton(TYPES.IHistoricoPrecoRepository, HistoricoPrecoRepository);
  // Registrar TalhaoRepository
  container.registerSingleton(TYPES.ITalhaoRepository, TalhaoRepository);
  // Registrar ConfiguradorCicloRepository
  container.registerSingleton(TYPES.IConfiguradorCicloRepository, ConfiguradorCicloRepository);
  // Registrar AtividadeAgricolaRepository
  container.registerSingleton(TYPES.IAtividadeAgricolaRepository, AtividadeAgricolaRepository);
  // Registrar AtividadeOperacaoRepository
  container.registerSingleton(TYPES.IAtividadeOperacaoRepository, AtividadeOperacaoRepository);
  // Registrar ApontamentoRepository
  container.registerSingleton(TYPES.IApontamentoRepository, ApontamentoRepository);
  // Registrar ApontamentoMaquinasRepository
  container.registerSingleton(TYPES.IApontamentoMaquinasRepository, ApontamentoMaquinasRepository);
  // Registrar ApontamentoProdutoRepository
  container.registerSingleton(TYPES.IApontamentoProdutoRepository, ApontamentoProdutoRepository);
  // Registrar ApontamentoServicoRepository
  container.registerSingleton(TYPES.IApontamentoServicoRepository, ApontamentoServicoRepository);
  // Registrar BenfeitoriaRepository
  container.registerSingleton(TYPES.IBenfeitoriaRepository, BenfeitoriaRepository);
  // Registrar ProdutoBenfeitoriaRepository
  container.registerSingleton(TYPES.IProdutoBenfeitoriaRepository, ProdutoBenfeitoriaRepository);
  // Registrar ServicoBenfeitoriaRepository
  container.registerSingleton(TYPES.IServicoBenfeitoriaRepository, ServicoBenfeitoriaRepository);
  // Registrar NotaFiscalRepository
  container.registerSingleton(TYPES.INotaFiscalRepository, NotaFiscalRepository);
  // Registrar ItemNotaFiscalRepository
  container.registerSingleton(TYPES.IItemNotaFiscalRepository, ItemNotaFiscalRepository);
  // Registrar PedidoCompraRepository
  container.registerSingleton(TYPES.IPedidoCompraRepository, PedidoCompraRepository);
  // Registrar ItemPedidoCompraRepository
  container.registerSingleton(TYPES.IItemPedidoCompraRepository, ItemPedidoCompraRepository);
  // Registrar BaixaPedidoCompraRepository
  container.registerSingleton(TYPES.IBaixaPedidoCompraRepository, BaixaPedidoCompraRepository);
  // Registrar ItemBaixaPedidoCompraRepository
  container.registerSingleton(TYPES.IItemBaixaPedidoCompraRepository, ItemBaixaPedidoCompraRepository);
  // Registrar EmprestimoRepository
  container.registerSingleton(TYPES.IEmprestimoRepository, EmprestimoRepository);
  // Registrar EmprestimoItemRepository
  container.registerSingleton(TYPES.IEmprestimoItemRepository, EmprestimoItemRepository);
  // Registrar EmprestimoItemDevolucaoRepository
  container.registerSingleton(TYPES.IEmprestimoItemDevolucaoRepository, EmprestimoItemDevolucaoRepository);
  // Registrar OutraDespesaReceitaRepository
  container.registerSingleton(TYPES.IOutraDespesaReceitaRepository, OutraDespesaReceitaRepository);
  // Registrar UnidadeDepositoRepository
  container.registerSingleton(TYPES.IUnidadeDepositoRepository, UnidadeDepositoRepository);
  // Registrar RegistroArmazenagemRepository
  container.registerSingleton(TYPES.IRegistroArmazenagemRepository, RegistroArmazenagemRepository);
  // Registrar AgreementRepository
  container.registerSingleton(TYPES.IAgreementRepository, AgreementRepository);
  // Registrar AgreementLeaseTermRepository
  container.registerSingleton(TYPES.IAgreementLeaseTermRepository, AgreementLeaseTermRepository);
  // Registrar AgreementPaymentScheduleRepository
  container.registerSingleton(TYPES.IAgreementPaymentScheduleRepository, AgreementPaymentScheduleRepository);
  // Registrar AgreementFieldRepository
  container.registerSingleton(TYPES.IAgreementFieldRepository, AgreementFieldRepository);
  // Registrar RecorrenciaFinanceiraRepository
  container.registerSingleton(TYPES.IRecorrenciaFinanceiraRepository, RecorrenciaFinanceiraRepository);
  // Registrar LancamentoRecorrenteRepository
  container.registerSingleton(TYPES.ILancamentoRecorrenteRepository, LancamentoRecorrenteRepository);
  // Registrar AlertaVencimentoConfigRepository
  container.registerSingleton(TYPES.IAlertaVencimentoConfigRepository, AlertaVencimentoConfigRepository);
  // Registrar AlertaVencimentoRepository
  container.registerSingleton(TYPES.IAlertaVencimentoRepository, AlertaVencimentoRepository);
  // Registrar FluxoCaixaConfiguracaoRepository
  container.registerSingleton(TYPES.IFluxoCaixaConfiguracaoRepository, FluxoCaixaConfiguracaoRepository);
  // Registrar FluxoCaixaSimulacaoRepository
  container.registerSingleton(TYPES.IFluxoCaixaSimulacaoRepository, FluxoCaixaSimulacaoRepository);
  // Registrar FluxoCaixaSimulacaoItemRepository
  container.registerSingleton(TYPES.IFluxoCaixaSimulacaoItemRepository, FluxoCaixaSimulacaoItemRepository);
  // Registrar NumeracaoReciboRepository
  container.registerSingleton(TYPES.INumeracaoReciboRepository, NumeracaoReciboRepository);
  // Registrar ConfiguracaoReciboRepository
  container.registerSingleton(TYPES.IConfiguracaoReciboRepository, ConfiguracaoReciboRepository);
  // Registrar ReciboRepository
  container.registerSingleton(TYPES.IReciboRepository, ReciboRepository);
  // Registrar TipoAtividadeOSRepository
  container.registerSingleton(TYPES.ITipoAtividadeOSRepository, TipoAtividadeOSRepository);
  // Registrar CampoCondicionalTipoAtividadeRepository
  container.registerSingleton(TYPES.ICampoCondicionalTipoAtividadeRepository, CampoCondicionalTipoAtividadeRepository);
  // Registrar OrdemServicoRepository
  container.registerSingleton(TYPES.IOrdemServicoRepository, OrdemServicoRepository);
  // Registrar OrdemServicoTalhaoRepository
  container.registerSingleton(TYPES.IOrdemServicoTalhaoRepository, OrdemServicoTalhaoRepository);
  // Registrar OrdemServicoInsumoRepository
  container.registerSingleton(TYPES.IOrdemServicoInsumoRepository, OrdemServicoInsumoRepository);
  // Registrar OrdemServicoMaquinaRepository
  container.registerSingleton(TYPES.IOrdemServicoMaquinaRepository, OrdemServicoMaquinaRepository);
  // Registrar OrdemServicoResponsavelRepository
  container.registerSingleton(TYPES.IOrdemServicoResponsavelRepository, OrdemServicoResponsavelRepository);
  // Registrar CfopRepository
  container.registerSingleton(TYPES.ICfopRepository, CfopRepository);
  // Registrar CertificadoDigitalRepository
  container.registerSingleton(TYPES.ICertificadoDigitalRepository, CertificadoDigitalRepository);
  // Registrar CotacaoRepository e CotacaoItemRepository
  container.registerSingleton(TYPES.ICotacaoRepository, CotacaoRepository);
  container.registerSingleton(TYPES.ICotacaoItemRepository, CotacaoItemRepository);
  // Registrar NumeracaoNfeRepository
  container.registerSingleton(TYPES.INumeracaoNfeRepository, NumeracaoNfeRepository);
  console.log('Repositories registered in DI container');
}
