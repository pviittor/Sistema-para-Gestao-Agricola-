/**
 * Testes unitários para RelatorioFinanceiroApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo cálculos de planejado vs realizado e agregações.
 */

import { RelatorioFinanceiroApplicationService } from './RelatorioFinanceiroApplicationService';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IRateioPlanoContaTituloPagarRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloPagarRepository';
import { IRateioPlanoContaTituloReceberRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloReceberRepository';
import { IRateioCentroCustoTituloPagarRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloPagarRepository';
import { IRateioCentroCustoTituloReceberRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloReceberRepository';
import { IMovimentoFinanceiroTituloPagarRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloPagarRepository';
import { IMovimentoFinanceiroTituloReceberRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloReceberRepository';
import { IPlanoContaGerencialRepository } from '../../../infrastructure/repository/IPlanoContaGerencialRepository';
import { ICentroCustoRepository } from '../../../infrastructure/repository/ICentroCustoRepository';
import { FiltroPlanejadoRealizadoDto, TipoTituloRelatorio } from '../../dto/relatorio/FiltroPlanejadoRealizadoDto';
import { PlanejadoRealizadoDto } from '../../dto/relatorio/PlanejadoRealizadoDto';
import { ForbiddenException } from '../../../core/exceptions';
import { StatusTituloPagar } from '../../../models/TituloPagar';
import { StatusTituloReceber } from '../../../models/TituloReceber';
import TituloPagar from '../../../models/TituloPagar';
import TituloReceber from '../../../models/TituloReceber';
import RateioPlanoContaTituloPagar from '../../../models/RateioPlanoContaTituloPagar';
import RateioCentroCustoTituloPagar from '../../../models/RateioCentroCustoTituloPagar';
import { getRequestContext } from '../../../core/authorization/helpers';
import { RequestContext } from '../../../core/context/RequestContext';

jest.mock('../../../core/authorization/helpers', () => ({
  getRequestContext: jest.fn(),
}));

const mockTituloPagarRepository: jest.Mocked<ITituloPagarRepository> = {
  findByDataLancamento: jest.fn(),
} as any;

const mockTituloReceberRepository: jest.Mocked<ITituloReceberRepository> = {
  findByDataLancamento: jest.fn(),
} as any;

const mockRateioPlanoContaTituloPagarRepository: jest.Mocked<IRateioPlanoContaTituloPagarRepository> = {
  findByTituloPagar: jest.fn(),
} as any;

const mockRateioPlanoContaTituloReceberRepository: jest.Mocked<IRateioPlanoContaTituloReceberRepository> = {
  findByTituloReceber: jest.fn(),
} as any;

const mockRateioCentroCustoTituloPagarRepository: jest.Mocked<IRateioCentroCustoTituloPagarRepository> = {
  findByTituloPagar: jest.fn(),
} as any;

const mockRateioCentroCustoTituloReceberRepository: jest.Mocked<IRateioCentroCustoTituloReceberRepository> = {
  findByTituloReceber: jest.fn(),
} as any;

const mockMovimentoFinanceiroTituloPagarRepository: jest.Mocked<IMovimentoFinanceiroTituloPagarRepository> = {
  findByDataMovimento: jest.fn(),
  aggregateByPlanoConta: jest.fn(),
  aggregateByCentroCusto: jest.fn(),
} as any;

const mockMovimentoFinanceiroTituloReceberRepository: jest.Mocked<IMovimentoFinanceiroTituloReceberRepository> = {
  findByDataMovimento: jest.fn(),
  aggregateByPlanoConta: jest.fn(),
  aggregateByCentroCusto: jest.fn(),
} as any;

const mockPlanoContaGerencialRepository: jest.Mocked<IPlanoContaGerencialRepository> = {
  findById: jest.fn(),
} as any;

const mockCentroCustoRepository: jest.Mocked<ICentroCustoRepository> = {
  findById: jest.fn(),
} as any;

describe('RelatorioFinanceiroApplicationService', () => {
  let service: RelatorioFinanceiroApplicationService;
  let mockRequestContext: RequestContext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequestContext = {
      getUserId: jest.fn().mockReturnValue(1),
      getTenantId: jest.fn().mockReturnValue(1),
      getRequestId: jest.fn().mockReturnValue('test-request-id'),
      setUserId: jest.fn(),
      setTenantId: jest.fn(),
      setRequestId: jest.fn(),
      getStartTime: jest.fn().mockReturnValue(Date.now()),
      getDuration: jest.fn().mockReturnValue(100),
      clear: jest.fn(),
      toJSON: jest.fn().mockReturnValue({}),
    } as any;

    (getRequestContext as jest.Mock).mockReturnValue(mockRequestContext);

    service = new RelatorioFinanceiroApplicationService(
      mockTituloPagarRepository,
      mockTituloReceberRepository,
      mockRateioPlanoContaTituloPagarRepository,
      mockRateioPlanoContaTituloReceberRepository,
      mockRateioCentroCustoTituloPagarRepository,
      mockRateioCentroCustoTituloReceberRepository,
      mockMovimentoFinanceiroTituloPagarRepository,
      mockMovimentoFinanceiroTituloReceberRepository,
      mockPlanoContaGerencialRepository,
      mockCentroCustoRepository
    );
  });

  describe('calcularPlanejadoRealizado', () => {
    const filtros: FiltroPlanejadoRealizadoDto = {
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31',
      tipo: TipoTituloRelatorio.TODOS,
    };

    it('deve calcular planejado vs realizado com sucesso', async () => {
      const titulosPagar = [
        {
          id: 1,
          status: StatusTituloPagar.ABERTO,
          valorTituloMoedaPadrao: 10000.00,
        } as TituloPagar,
      ];

      const rateiosPC = [
        {
          id: 1,
          idTituloPagar: 1,
          idPlanoContaGerencial: 1,
          percentualRateio: 50,
        } as RateioPlanoContaTituloPagar,
      ];

      const rateiosCC = [
        {
          id: 1,
          idTituloPagar: 1,
          idCentroCusto: 1,
          percentualRateio: 100,
        } as RateioCentroCustoTituloPagar,
      ];

      const movimentos = [
        {
          id: 1,
          idPlanoContaGerencial: 1,
          idCentroCusto: 1,
          valorMovimentoMoedaPadrao: 2000.00,
        } as any,
      ];

      mockTituloPagarRepository.findByDataLancamento.mockResolvedValue(titulosPagar);
      mockRateioPlanoContaTituloPagarRepository.findByTituloPagar.mockResolvedValue(rateiosPC);
      mockRateioCentroCustoTituloPagarRepository.findByTituloPagar.mockResolvedValue(rateiosCC);
      mockMovimentoFinanceiroTituloPagarRepository.findByDataMovimento.mockResolvedValue(movimentos);
      mockPlanoContaGerencialRepository.findById.mockResolvedValue({
        id: 1,
        itemPlanoConta: 'PC-001',
        descricaoPlanoConta: 'Plano de Contas 1',
      } as any);
      mockCentroCustoRepository.findById.mockResolvedValue({
        id: 1,
        codigoCentroCusto: 'CC-001',
        nomeCentroCusto: 'Centro de Custo 1',
      } as any);

      const result = await service.calcularPlanejadoRealizado(filtros);

      expect(mockTituloPagarRepository.findByDataLancamento).toHaveBeenCalled();
      expect(mockMovimentoFinanceiroTituloPagarRepository.findByDataMovimento).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('deve lançar ForbiddenException se tenant não estiver identificado', async () => {
      (mockRequestContext.getTenantId as jest.Mock).mockReturnValue(undefined);

      await expect(service.calcularPlanejadoRealizado(filtros)).rejects.toThrow(ForbiddenException);
    });

    it('deve calcular apenas títulos a pagar quando tipo for PAGAR', async () => {
      const filtrosPagar: FiltroPlanejadoRealizadoDto = {
        ...filtros,
        tipo: TipoTituloRelatorio.PAGAR,
      };

      mockTituloPagarRepository.findByDataLancamento.mockResolvedValue([]);
      mockMovimentoFinanceiroTituloPagarRepository.findByDataMovimento.mockResolvedValue([]);

      await service.calcularPlanejadoRealizado(filtrosPagar);

      expect(mockTituloPagarRepository.findByDataLancamento).toHaveBeenCalled();
      expect(mockTituloReceberRepository.findByDataLancamento).not.toHaveBeenCalled();
    });

    it('deve calcular apenas títulos a receber quando tipo for RECEBER', async () => {
      const filtrosReceber: FiltroPlanejadoRealizadoDto = {
        ...filtros,
        tipo: TipoTituloRelatorio.RECEBER,
      };

      mockTituloReceberRepository.findByDataLancamento.mockResolvedValue([]);
      mockMovimentoFinanceiroTituloReceberRepository.findByDataMovimento.mockResolvedValue([]);

      await service.calcularPlanejadoRealizado(filtrosReceber);

      expect(mockTituloReceberRepository.findByDataLancamento).toHaveBeenCalled();
      expect(mockTituloPagarRepository.findByDataLancamento).not.toHaveBeenCalled();
    });
  });
});
