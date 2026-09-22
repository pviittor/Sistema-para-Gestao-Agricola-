/**
 * Testes unitários para ParcelaApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações de baixa, criação de movimentos financeiros e cálculos.
 */

import { ParcelaApplicationService } from './ParcelaApplicationService';
import { IParcelaTituloPagarRepository } from '../../../infrastructure/repository/IParcelaTituloPagarRepository';
import { IParcelaTituloReceberRepository } from '../../../infrastructure/repository/IParcelaTituloReceberRepository';
import { ITituloPagarRepository } from '../../../infrastructure/repository/ITituloPagarRepository';
import { ITituloReceberRepository } from '../../../infrastructure/repository/ITituloReceberRepository';
import { IRateioPlanoContaTituloPagarRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloPagarRepository';
import { IRateioPlanoContaTituloReceberRepository } from '../../../infrastructure/repository/IRateioPlanoContaTituloReceberRepository';
import { IRateioCentroCustoTituloPagarRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloPagarRepository';
import { IRateioCentroCustoTituloReceberRepository } from '../../../infrastructure/repository/IRateioCentroCustoTituloReceberRepository';
import { IMovimentoFinanceiroTituloPagarRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloPagarRepository';
import { IMovimentoFinanceiroTituloReceberRepository } from '../../../infrastructure/repository/IMovimentoFinanceiroTituloReceberRepository';
import { IMoedaConversionService } from '../moedaConversion/IMoedaConversionService';
import { IAuditService } from '../../../core/audit/IAuditService';
import { BaixaParcelaTituloPagarDto } from '../../dto/parcelaTituloPagar/BaixaParcelaTituloPagarDto';
import { BaixaParcelaTituloReceberDto } from '../../dto/parcelaTituloReceber/BaixaParcelaTituloReceberDto';
import { ParcelaTituloPagarResponseDto } from '../../dto/parcelaTituloPagar/ParcelaTituloPagarResponseDto';
import { ParcelaTituloReceberResponseDto } from '../../dto/parcelaTituloReceber/ParcelaTituloReceberResponseDto';
import { NotFoundException, BusinessException, ForbiddenException } from '../../../core/exceptions';
import { StatusParcela } from '../../../models/ParcelaTituloPagar';
import { StatusTituloPagar } from '../../../models/TituloPagar';
import ParcelaTituloPagar from '../../../models/ParcelaTituloPagar';
import TituloPagar from '../../../models/TituloPagar';
import { getRequestContext } from '../../../core/authorization/helpers';
import { RequestContext } from '../../../core/context/RequestContext';

jest.mock('../../../core/authorization/helpers', () => ({
  getRequestContext: jest.fn(),
}));

const mockParcelaTituloPagarRepository: jest.Mocked<IParcelaTituloPagarRepository> = {
  findById: jest.fn(),
  update: jest.fn(),
  findByTituloPagar: jest.fn(),
} as any;

const mockParcelaTituloReceberRepository: jest.Mocked<IParcelaTituloReceberRepository> = {
  findById: jest.fn(),
  update: jest.fn(),
  findByTituloReceber: jest.fn(),
} as any;

const mockTituloPagarRepository: jest.Mocked<ITituloPagarRepository> = {
  findById: jest.fn(),
  update: jest.fn(),
} as any;

const mockTituloReceberRepository: jest.Mocked<ITituloReceberRepository> = {
  findById: jest.fn(),
  update: jest.fn(),
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
  findByParcela: jest.fn(),
  create: jest.fn(),
} as any;

const mockMovimentoFinanceiroTituloReceberRepository: jest.Mocked<IMovimentoFinanceiroTituloReceberRepository> = {
  findByParcela: jest.fn(),
  create: jest.fn(),
} as any;

const mockMoedaConversionService: jest.Mocked<IMoedaConversionService> = {
  converterParaMoedaPadrao: jest.fn(),
} as any;

const mockAuditService: jest.Mocked<IAuditService> = {
  logCreate: jest.fn(),
  logUpdate: jest.fn(),
} as any;

describe('ParcelaApplicationService', () => {
  let service: ParcelaApplicationService;
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

    service = new ParcelaApplicationService(
      mockAuditService,
      mockParcelaTituloPagarRepository,
      mockParcelaTituloReceberRepository,
      mockTituloPagarRepository,
      mockTituloReceberRepository,
      mockRateioPlanoContaTituloPagarRepository,
      mockRateioPlanoContaTituloReceberRepository,
      mockRateioCentroCustoTituloPagarRepository,
      mockRateioCentroCustoTituloReceberRepository,
      mockMovimentoFinanceiroTituloPagarRepository,
      mockMovimentoFinanceiroTituloReceberRepository,
      mockMoedaConversionService
    );
  });

  describe('baixarParcelaTituloPagar', () => {
    const baixaDto: BaixaParcelaTituloPagarDto = {
      dataBaixa: '2024-01-15',
      valorBaixa: 2000.00,
      observacao: 'Pagamento realizado',
    };

    it('deve baixar parcela com sucesso', async () => {
      const parcela = {
        id: 1,
        idTituloPagar: 1,
        valorParcela: 3000.00,
        valorBaixa: 0,
        status: StatusParcela.ABERTA,
        dataVencimento: new Date('2024-01-20'),
      } as ParcelaTituloPagar;

      const titulo = {
        id: 1,
        dataLancamento: new Date('2024-01-10'),
        status: StatusTituloPagar.ABERTO,
      } as TituloPagar;

      const parcelaAtualizada = {
        ...parcela,
        valorBaixa: 2000.00,
        status: StatusParcela.ABERTA,
      } as ParcelaTituloPagar;

      const responseDto: ParcelaTituloPagarResponseDto = {
        id: 1,
        valorBaixa: 2000.00,
        status: StatusParcela.ABERTA,
      } as any;

      mockParcelaTituloPagarRepository.findById.mockResolvedValue(parcela);
      mockTituloPagarRepository.findById.mockResolvedValue(titulo);
      mockRateioPlanoContaTituloPagarRepository.findByTituloPagar.mockResolvedValue([]);
      mockRateioCentroCustoTituloPagarRepository.findByTituloPagar.mockResolvedValue([]);
      mockParcelaTituloPagarRepository.update.mockResolvedValue(parcelaAtualizada);
      (service as any).parcelaTituloPagarMapper = {
        toDto: jest.fn().mockReturnValue(responseDto),
      };

      const result = await service.baixarParcelaTituloPagar(1, baixaDto);

      expect(mockParcelaTituloPagarRepository.findById).toHaveBeenCalledWith(1);
      expect(mockTituloPagarRepository.findById).toHaveBeenCalledWith(1);
      expect(mockParcelaTituloPagarRepository.update).toHaveBeenCalled();
      expect(result).toEqual(responseDto);
    });

    it('deve lançar NotFoundException se parcela não existir', async () => {
      mockParcelaTituloPagarRepository.findById.mockResolvedValue(null);

      await expect(service.baixarParcelaTituloPagar(1, baixaDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BusinessException se parcela estiver cancelada', async () => {
      const parcela = {
        id: 1,
        status: StatusParcela.CANCELADA,
      } as ParcelaTituloPagar;

      mockParcelaTituloPagarRepository.findById.mockResolvedValue(parcela);

      await expect(service.baixarParcelaTituloPagar(1, baixaDto)).rejects.toThrow(BusinessException);
    });

    it('deve lançar BusinessException se valor da baixa for maior que valor pendente', async () => {
      const parcela = {
        id: 1,
        valorParcela: 1000.00,
        valorBaixa: 500.00,
        status: StatusParcela.ABERTA,
      } as ParcelaTituloPagar;

      const titulo = {
        id: 1,
        dataLancamento: new Date('2024-01-10'),
      } as TituloPagar;

      mockParcelaTituloPagarRepository.findById.mockResolvedValue(parcela);
      mockTituloPagarRepository.findById.mockResolvedValue(titulo);

      const baixaDtoInvalido: BaixaParcelaTituloPagarDto = {
        ...baixaDto,
        valorBaixa: 600.00, // Maior que valor pendente (1000 - 500 = 500)
      };

      await expect(service.baixarParcelaTituloPagar(1, baixaDtoInvalido)).rejects.toThrow(BusinessException);
    });

    it('deve lançar BusinessException se data de baixa for anterior à data de lançamento', async () => {
      const parcela = {
        id: 1,
        valorParcela: 3000.00,
        valorBaixa: 0,
        status: StatusParcela.ABERTA,
      } as ParcelaTituloPagar;

      const titulo = {
        id: 1,
        dataLancamento: new Date('2024-01-20'), // Data posterior à baixa
      } as TituloPagar;

      mockParcelaTituloPagarRepository.findById.mockResolvedValue(parcela);
      mockTituloPagarRepository.findById.mockResolvedValue(titulo);

      await expect(service.baixarParcelaTituloPagar(1, baixaDto)).rejects.toThrow(BusinessException);
    });
  });

  describe('consultarMovimentosParcelaTituloPagar', () => {
    it('deve retornar movimentos financeiros da parcela', async () => {
      const movimentos = [
        { id: 1, valorMovimento: 1000.00 } as any,
        { id: 2, valorMovimento: 1000.00 } as any,
      ];

      mockMovimentoFinanceiroTituloPagarRepository.findByParcela.mockResolvedValue(movimentos);

      const result = await service.consultarMovimentosParcelaTituloPagar(1);

      expect(mockMovimentoFinanceiroTituloPagarRepository.findByParcela).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });
  });
});
