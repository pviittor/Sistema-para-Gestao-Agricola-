/**
 * Registro de Controllers no Container de DI
 * 
 * Este arquivo registra todos os controllers no container de DI
 * usando os tokens definidos em TYPES.
 * 
 * IMPORTANTE: Este arquivo deve ser importado antes de chamar initializeContainer()
 * para garantir que os controllers estejam registrados.
 */

import { container } from './container';
import { TYPES } from './types';

// Importar controllers
import AuthController from '../../controllers/AuthController';
import UsuarioController from '../../controllers/UsuarioController';
import EventoController from '../../controllers/EventoController';
import FinanceiroController from '../../controllers/FinanceiroController';
import LembreteController from '../../controllers/LembreteController';
import LocalController from '../../controllers/LocalController';
import RoleController from '../../controllers/RoleController';
import PermissaoController from '../../controllers/PermissaoController';
import { AuditLogController } from '../../controllers/AuditLogController';
import { PessoaController } from '../../controllers/PessoaController';
import { GrupoProdutoController } from '../../controllers/GrupoProdutoController';
import { SubGrupoProdutoController } from '../../controllers/SubGrupoProdutoController';
import { PrincipioAtivoController } from '../../controllers/PrincipioAtivoController';
import { UnidadeMedidaController } from '../../controllers/UnidadeMedidaController';
import { MoedaController } from '../../controllers/MoedaController';
import { MoedaCotacaoController } from '../../controllers/MoedaCotacaoController';
import { ProdutoController } from '../../controllers/ProdutoController';
import { CulturaController } from '../../controllers/CulturaController';
import { ServicoAgricolaController } from '../../controllers/ServicoAgricolaController';
import { PlanoContaGerencialController } from '../../controllers/PlanoContaGerencialController';
import { ConsultoriaController } from '../../controllers/ConsultoriaController';
import { TenantController } from '../../controllers/TenantController';
import { EstadoController } from '../../controllers/EstadoController';
import { MunicipioController } from '../../controllers/MunicipioController';
import { CentroCustoController } from '../../controllers/CentroCustoController';
import { SafraController } from '../../controllers/SafraController';
import { FazendaController } from '../../controllers/FazendaController';
import TituloPagarController from '../../controllers/TituloPagarController';
import TituloReceberController from '../../controllers/TituloReceberController';
import ParcelaController from '../../controllers/ParcelaController';
import RelatorioFinanceiroController from '../../controllers/RelatorioFinanceiroController';
import { ContaController } from '../../controllers/ContaController';
import { GrupoEquipamentoController } from '../../controllers/GrupoEquipamentoController';
import { MaquinaController } from '../../controllers/MaquinaController';
import { AbastecimentoController } from '../../controllers/AbastecimentoController';
import { MovimentoEstoqueController } from '../../controllers/MovimentoEstoqueController';
import { TalhaoController } from '../../controllers/TalhaoController';
import { ConfiguradorCicloController } from '../../controllers/ConfiguradorCicloController';
import { AtividadeAgricolaController } from '../../controllers/AtividadeAgricolaController';
import { AtividadeOperacaoController } from '../../controllers/AtividadeOperacaoController';
import { ApontamentoController } from '../../controllers/ApontamentoController';
import { ApontamentoMaquinasController } from '../../controllers/ApontamentoMaquinasController';
import { ApontamentoProdutoController } from '../../controllers/ApontamentoProdutoController';
import { ApontamentoServicoController } from '../../controllers/ApontamentoServicoController';
import { BenfeitoriaController } from '../../controllers/BenfeitoriaController';
import { ProdutoBenfeitoriaController } from '../../controllers/ProdutoBenfeitoriaController';
import { ServicoBenfeitoriaController } from '../../controllers/ServicoBenfeitoriaController';
import { ListaBancosController } from '../../controllers/ListaBancosController';
import { NotaFiscalController } from '../../controllers/NotaFiscalController';
import { ItemNotaFiscalController } from '../../controllers/ItemNotaFiscalController';
import { PedidoCompraController } from '../../controllers/PedidoCompraController';
import { ItemPedidoCompraController } from '../../controllers/ItemPedidoCompraController';
import { BaixaPedidoCompraController } from '../../controllers/BaixaPedidoCompraController';
import { ItemBaixaPedidoCompraController } from '../../controllers/ItemBaixaPedidoCompraController';
import { EmprestimoController } from '../../controllers/EmprestimoController';
import { EmprestimoItemController } from '../../controllers/EmprestimoItemController';
import { EmprestimoItemDevolucaoController } from '../../controllers/EmprestimoItemDevolucaoController';
import { OutraDespesaReceitaController } from '../../controllers/OutraDespesaReceitaController';
import { UnidadeDepositoController } from '../../controllers/UnidadeDepositoController';
import { RegistroArmazenagemController } from '../../controllers/RegistroArmazenagemController';
import { AgreementController } from '../../controllers/AgreementController';
import { RecorrenciaFinanceiraController } from '../../controllers/RecorrenciaFinanceiraController';
import { AlertaVencimentoConfigController } from '../../controllers/AlertaVencimentoConfigController';
import { AgingReportController } from '../../controllers/AgingReportController';
import { FluxoCaixaController } from '../../controllers/FluxoCaixaController';
import { FluxoCaixaConfiguracaoController } from '../../controllers/FluxoCaixaConfiguracaoController';
import { FluxoCaixaSimulacaoController } from '../../controllers/FluxoCaixaSimulacaoController';
import { NumeracaoReciboController } from '../../controllers/NumeracaoReciboController';
import { ConfiguracaoReciboController } from '../../controllers/ConfiguracaoReciboController';
import { ReciboController } from '../../controllers/ReciboController';
import { CfopController } from '../../controllers/CfopController';
import { CertificadoDigitalController } from '../../controllers/CertificadoDigitalController';
import { CotacaoController } from '../../controllers/CotacaoController';
import { NumeracaoNfeController } from '../../controllers/NumeracaoNfeController';
import RoleHasPermissaoController from '../../controllers/RoleHasPermissaoController';
import UsuarioHasRoleController from '../../controllers/UsuarioHasRoleController';
import UsuarioHasSubUsuarioController from '../../controllers/UsuarioHasSubUsuarioController';
import { TipoAtividadeOSController } from '../../controllers/TipoAtividadeOSController';
import { OrdemServicoController } from '../../controllers/OrdemServicoController';

/**
 * Registra todos os controllers no container de DI
 * 
 * Esta função deve ser chamada antes de initializeContainer()
 * ou dentro de initializeContainer() se importada lá.
 */
export function registerControllers(): void {
  // Registrar controllers com seus tokens de interface
  container.registerSingleton(TYPES.IAuthController, AuthController);
  container.registerSingleton(TYPES.IUsuarioController, UsuarioController);
  container.registerSingleton(TYPES.IEventoController, EventoController);
  container.registerSingleton(TYPES.IFinanceiroController, FinanceiroController);
  container.registerSingleton(TYPES.ILembreteController, LembreteController);
  container.registerSingleton(TYPES.ILocalController, LocalController);
  container.registerSingleton(TYPES.IRoleController, RoleController);
  container.registerSingleton(TYPES.IPermissaoController, PermissaoController);
  container.registerSingleton(TYPES.IAuditLogController, AuditLogController);
  container.registerSingleton(TYPES.IPessoaController, PessoaController);
  container.registerSingleton(TYPES.IGrupoProdutoController, GrupoProdutoController);
  container.registerSingleton(TYPES.ISubGrupoProdutoController, SubGrupoProdutoController);
  container.registerSingleton(TYPES.IPrincipioAtivoController, PrincipioAtivoController);
  container.registerSingleton(TYPES.IUnidadeMedidaController, UnidadeMedidaController);
  container.registerSingleton(TYPES.IMoedaController, MoedaController);
  container.registerSingleton(TYPES.IMoedaCotacaoController, MoedaCotacaoController);
  container.registerSingleton(TYPES.IProdutoController, ProdutoController);
  container.registerSingleton(TYPES.ICulturaController, CulturaController);
  container.registerSingleton(TYPES.IServicoAgricolaController, ServicoAgricolaController);
  container.registerSingleton(TYPES.IPlanoContaGerencialController, PlanoContaGerencialController);
  container.registerSingleton(TYPES.IConsultoriaController, ConsultoriaController);
  container.registerSingleton(TYPES.ITenantController, TenantController);
  container.registerSingleton(TYPES.IEstadoController, EstadoController);
  container.registerSingleton(TYPES.IMunicipioController, MunicipioController);
  container.registerSingleton(TYPES.ICentroCustoController, CentroCustoController);
  container.registerSingleton(TYPES.ISafraController, SafraController);
  container.registerSingleton(TYPES.IFazendaController, FazendaController);
  container.registerSingleton(TYPES.ITituloPagarController, TituloPagarController);
  container.registerSingleton(TYPES.ITituloReceberController, TituloReceberController);
  container.registerSingleton(TYPES.IParcelaController, ParcelaController);
  container.registerSingleton(TYPES.IRelatorioFinanceiroController, RelatorioFinanceiroController);
  container.registerSingleton(TYPES.IContaController, ContaController);
  container.registerSingleton(TYPES.IGrupoEquipamentoController, GrupoEquipamentoController);
  container.registerSingleton(TYPES.IMaquinaController, MaquinaController);
  container.registerSingleton(TYPES.IAbastecimentoController, AbastecimentoController);
  container.registerSingleton(TYPES.IMovimentoEstoqueController, MovimentoEstoqueController);
  container.registerSingleton(TYPES.ITalhaoController, TalhaoController);
  container.registerSingleton(TYPES.IConfiguradorCicloController, ConfiguradorCicloController);
  container.registerSingleton(TYPES.IAtividadeAgricolaController, AtividadeAgricolaController);
  container.registerSingleton(TYPES.IAtividadeOperacaoController, AtividadeOperacaoController);
  container.registerSingleton(TYPES.IApontamentoController, ApontamentoController);
  container.registerSingleton(TYPES.IApontamentoMaquinasController, ApontamentoMaquinasController);
  container.registerSingleton(TYPES.IApontamentoProdutoController, ApontamentoProdutoController);
  container.registerSingleton(TYPES.IApontamentoServicoController, ApontamentoServicoController);
  container.registerSingleton(TYPES.IBenfeitoriaController, BenfeitoriaController);
  container.registerSingleton(TYPES.IProdutoBenfeitoriaController, ProdutoBenfeitoriaController);
  container.registerSingleton(TYPES.IServicoBenfeitoriaController, ServicoBenfeitoriaController);
  container.registerSingleton(TYPES.IListaBancosController, ListaBancosController);
  container.registerSingleton(TYPES.INotaFiscalController, NotaFiscalController);
  container.registerSingleton(TYPES.IItemNotaFiscalController, ItemNotaFiscalController);
  container.registerSingleton(TYPES.IPedidoCompraController, PedidoCompraController);
  container.registerSingleton(TYPES.IItemPedidoCompraController, ItemPedidoCompraController);
  container.registerSingleton(TYPES.IBaixaPedidoCompraController, BaixaPedidoCompraController);
  container.registerSingleton(TYPES.IItemBaixaPedidoCompraController, ItemBaixaPedidoCompraController);
  container.registerSingleton(TYPES.IEmprestimoController, EmprestimoController);
  container.registerSingleton(TYPES.IEmprestimoItemController, EmprestimoItemController);
  container.registerSingleton(TYPES.IEmprestimoItemDevolucaoController, EmprestimoItemDevolucaoController);
  container.registerSingleton(TYPES.IOutraDespesaReceitaController, OutraDespesaReceitaController);
  container.registerSingleton(TYPES.IUnidadeDepositoController, UnidadeDepositoController);
  container.registerSingleton(TYPES.IRegistroArmazenagemController, RegistroArmazenagemController);
  container.registerSingleton(TYPES.IAgreementController, AgreementController);
  container.registerSingleton(TYPES.IRecorrenciaFinanceiraController, RecorrenciaFinanceiraController);
  container.registerSingleton(TYPES.IAlertaVencimentoConfigController, AlertaVencimentoConfigController);
  container.registerSingleton(TYPES.IAgingReportController, AgingReportController);
  container.registerSingleton(TYPES.IFluxoCaixaController, FluxoCaixaController);
  container.registerSingleton(TYPES.IFluxoCaixaConfiguracaoController, FluxoCaixaConfiguracaoController);
  container.registerSingleton(TYPES.IFluxoCaixaSimulacaoController, FluxoCaixaSimulacaoController);
  container.registerSingleton(TYPES.INumeracaoReciboController, NumeracaoReciboController);
  container.registerSingleton(TYPES.IConfiguracaoReciboController, ConfiguracaoReciboController);
  container.registerSingleton(TYPES.IReciboController, ReciboController);
  container.registerSingleton(TYPES.ITipoAtividadeOSController, TipoAtividadeOSController);
  container.registerSingleton(TYPES.IOrdemServicoController, OrdemServicoController);
  container.registerSingleton(TYPES.ICfopController, CfopController);
  // Registrar CertificadoDigitalController
  container.registerSingleton(TYPES.ICertificadoDigitalController, CertificadoDigitalController);
  // Registrar CotacaoController
  container.registerSingleton(TYPES.ICotacaoController, CotacaoController);
  // Registrar NumeracaoNfeController
  container.registerSingleton(TYPES.INumeracaoNfeController, NumeracaoNfeController);

  // Registrar controllers de relacionamentos (não possuem interfaces específicas)
  container.registerSingleton(RoleHasPermissaoController, RoleHasPermissaoController);
  container.registerSingleton(UsuarioHasRoleController, UsuarioHasRoleController);
  container.registerSingleton(UsuarioHasSubUsuarioController, UsuarioHasSubUsuarioController);
  
  console.log('Controllers registered in DI container');
}
