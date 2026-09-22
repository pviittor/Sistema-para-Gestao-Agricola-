/**
 * Testes unitários para EventoApplicationService
 * 
 * Estes testes verificam a lógica de negócio do Application Service,
 * incluindo validações, regras de negócio e integração com repositório e mapper.
 */

import { EventoApplicationService } from './EventoApplicationService';
import { IEventoRepository } from '../../../infrastructure/repository/IEventoRepository';
import { EventoMapper } from '../../mappers/EventoMapper';
import { CreateEventoDto } from '../../dto/evento/CreateEventoDto';
import { UpdateEventoDto } from '../../dto/evento/UpdateEventoDto';
import { EventoResponseDto } from '../../dto/evento/EventoResponseDto';
import { BusinessException, NotFoundException } from '../../../core/exceptions';
import Evento from '../../../models/Evento';

// Mock do repositório
const mockRepository: jest.Mocked<IEventoRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findMany: jest.fn(),
  findAllPaginated: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByLocal: jest.fn(),
  findByData: jest.fn(),
};

// Mock do mapper
const mockMapper: jest.Mocked<EventoMapper> = {
  toEntity: jest.fn(),
  toDto: jest.fn(),
} as any;

describe('EventoApplicationService', () => {
  let service: EventoApplicationService;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Criar service com repositório mockado
    service = new EventoApplicationService(mockRepository);
    
    // Substituir mapper interno por mock para testes específicos
    (service as any).mapper = mockMapper;
  });

  describe('create', () => {
    const createDto: CreateEventoDto = {
      titulo: 'Reunião de Planejamento',
      descricao: 'Reunião para planejar as atividades',
      data: '2025-12-31', // Data futura
      horario_inicio: '09:00:00',
      horario_fim: '11:00:00',
      localId: 1,
    };

    it('deve criar evento com sucesso', async () => {
      // Arrange
      const createdEntity = {
        id: 1,
        ...createDto,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Evento;

      const responseDto: EventoResponseDto = {
        id: 1,
        titulo: 'Reunião de Planejamento',
        descricao: 'Reunião para planejar as atividades',
        data: '2025-12-31',
        horario_inicio: '09:00:00',
        horario_fim: '11:00:00',
        localId: 1,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockMapper.toEntity.mockResolvedValue({ titulo: createDto.titulo } as any);
      mockRepository.create.mockResolvedValue(createdEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(mockMapper.toEntity).toHaveBeenCalledWith(createDto);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(createdEntity);
      expect(result).toEqual(responseDto);
    });

    it('deve lançar BusinessException se data for no passado', async () => {
      // Arrange
      const dtoComDataPassada: CreateEventoDto = {
        ...createDto,
        data: '2020-01-01', // Data no passado
      };

      // Act & Assert
      await expect(service.create(dtoComDataPassada)).rejects.toThrow(BusinessException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se horário de fim não for posterior ao de início', async () => {
      // Arrange
      const dtoComHorarioInvalido: CreateEventoDto = {
        ...createDto,
        horario_inicio: '11:00:00',
        horario_fim: '09:00:00', // Fim antes do início
      };

      // Act & Assert
      await expect(service.create(dtoComHorarioInvalido)).rejects.toThrow(BusinessException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateEventoDto = {
      titulo: 'Reunião Atualizada',
    };

    it('deve atualizar evento com sucesso', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        titulo: 'Reunião',
        data: '2025-12-31',
        horario_inicio: '09:00:00',
        horario_fim: '11:00:00',
      } as Evento;

      const updatedEntity = {
        ...existingEntity,
        titulo: 'Reunião Atualizada',
      } as Evento;

      const responseDto: EventoResponseDto = {
        id: 1,
        titulo: 'Reunião Atualizada',
        descricao: 'Descrição',
        data: '2025-12-31',
        horario_inicio: '09:00:00',
        horario_fim: '11:00:00',
        localId: 1,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingEntity);
      mockMapper.toEntity.mockResolvedValue({ titulo: updateDto.titulo } as any);
      mockRepository.update.mockResolvedValue(updatedEntity);
      mockMapper.toDto.mockReturnValue(responseDto);

      // Act
      const result = await service.update(1, updateDto);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toEntity).toHaveBeenCalledWith(updateDto);
      expect(mockRepository.update).toHaveBeenCalled();
      expect(mockMapper.toDto).toHaveBeenCalledWith(updatedEntity);
      expect(result).toEqual(responseDto);
    });

    it('deve lançar NotFoundException se evento não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('deve lançar BusinessException se nova data for no passado', async () => {
      // Arrange
      const existingEntity = {
        id: 1,
        data: '2025-12-31',
      } as Evento;

      const updateComDataPassada: UpdateEventoDto = {
        data: '2020-01-01',
      };

      mockRepository.findById.mockResolvedValue(existingEntity);

      // Act & Assert
      await expect(service.update(1, updateComDataPassada)).rejects.toThrow(BusinessException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deve remover evento com sucesso', async () => {
      // Arrange
      const existingEntity = { id: 1 } as Evento;
      mockRepository.findById.mockResolvedValue(existingEntity);
      mockRepository.delete.mockResolvedValue(true);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('deve retornar false se evento não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.delete(1);

      // Assert
      expect(result).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('deve retornar DTO do evento encontrado', async () => {
      // Arrange
      const entity = { id: 1, titulo: 'Reunião' } as Evento;
      const dto: EventoResponseDto = {
        id: 1,
        titulo: 'Reunião',
        descricao: 'Descrição',
        data: '2025-12-31',
        horario_inicio: '09:00:00',
        horario_fim: '11:00:00',
        localId: 1,
        usuarioId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(entity);
      mockMapper.toDto.mockReturnValue(dto);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockMapper.toDto).toHaveBeenCalledWith(entity);
      expect(result).toEqual(dto);
    });

    it('deve retornar null se evento não existir', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act
      const result = await service.getById(1);

      // Assert
      expect(result).toBeNull();
      expect(mockMapper.toDto).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('deve retornar lista paginada de eventos', async () => {
      // Arrange
      const entities = [
        { id: 1, titulo: 'Evento 1' } as Evento,
        { id: 2, titulo: 'Evento 2' } as Evento,
      ];

      const dtos: EventoResponseDto[] = [
        {
          id: 1,
          titulo: 'Evento 1',
          descricao: 'Descrição 1',
          data: '2025-12-31',
          horario_inicio: '09:00:00',
          horario_fim: '11:00:00',
          localId: 1,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          titulo: 'Evento 2',
          descricao: 'Descrição 2',
          data: '2025-12-31',
          horario_inicio: '14:00:00',
          horario_fim: '16:00:00',
          localId: 1,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findAllPaginated.mockResolvedValue({
        data: entities,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.list(1, 10);

      // Assert
      expect(mockRepository.findAllPaginated).toHaveBeenCalledWith(1, 10);
      expect(result.data).toEqual(dtos);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findByLocal', () => {
    it('deve retornar array de DTOs de eventos do local', async () => {
      // Arrange
      const entities = [
        { id: 1, localId: 1 } as Evento,
        { id: 2, localId: 1 } as Evento,
      ];

      const dtos: EventoResponseDto[] = [
        {
          id: 1,
          titulo: 'Evento 1',
          descricao: 'Descrição 1',
          data: '2025-12-31',
          horario_inicio: '09:00:00',
          horario_fim: '11:00:00',
          localId: 1,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          titulo: 'Evento 2',
          descricao: 'Descrição 2',
          data: '2025-12-31',
          horario_inicio: '14:00:00',
          horario_fim: '16:00:00',
          localId: 1,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByLocal.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findByLocal(1);

      // Assert
      expect(mockRepository.findByLocal).toHaveBeenCalledWith(1);
      expect(result).toEqual(dtos);
    });
  });

  describe('findByData', () => {
    it('deve retornar array de DTOs de eventos no período', async () => {
      // Arrange
      const entities = [
        { id: 1, data: '2025-01-15' } as Evento,
        { id: 2, data: '2025-01-20' } as Evento,
      ];

      const dtos: EventoResponseDto[] = [
        {
          id: 1,
          titulo: 'Evento 1',
          descricao: 'Descrição 1',
          data: '2025-01-15',
          horario_inicio: '09:00:00',
          horario_fim: '11:00:00',
          localId: 1,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          titulo: 'Evento 2',
          descricao: 'Descrição 2',
          data: '2025-01-20',
          horario_inicio: '14:00:00',
          horario_fim: '16:00:00',
          localId: 1,
          usuarioId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findByData.mockResolvedValue(entities);
      mockMapper.toDto
        .mockReturnValueOnce(dtos[0])
        .mockReturnValueOnce(dtos[1]);

      // Act
      const result = await service.findByData('2025-01-01', '2025-01-31');

      // Assert
      expect(mockRepository.findByData).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(result).toEqual(dtos);
    });
  });
});
