import { Request, Response } from 'express';
import Local from '../models/Local';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IEventoController } from './interfaces/IEventoController';
import { IEventoApplicationService } from '../application/services/evento/IEventoApplicationService';
import { CreateEventoDto } from '../application/dto/evento/CreateEventoDto';
import { UpdateEventoDto } from '../application/dto/evento/UpdateEventoDto';
import { EventoResponseDto, EventoDetailResponseDto } from '../application/dto/evento/EventoResponseDto';
import { NotFoundException, ForbiddenException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de eventos
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o EventoApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Enriquecer com relacionamentos quando necessário
 */
@Injectable()
export class EventoController implements IEventoController {
  constructor(
    @Inject(TYPES.IEventoApplicationService)
    private eventoService: IEventoApplicationService
  ) {}

  async index(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // Usar service para listar eventos
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    // TODO: Service deveria filtrar por usuarioId, por enquanto filtramos manualmente
    const result = await this.eventoService.list(page, limit);
    const eventosDoUsuario = result.data.filter(e => e.usuarioId === Number(userId));

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    // Buscar locais para enriquecer resposta
    const eventosComLocal: EventoDetailResponseDto[] = await Promise.all(
      eventosDoUsuario.map(async (evento) => {
        const local = await Local.findByPk(evento.localId);
        return {
          ...evento,
          local: local ? (local.toJSON() as any) : undefined,
        };
      })
    );

    return res.json({
      ...result,
      data: eventosComLocal,
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar evento
    const evento = await this.eventoService.getById(id);
    
    if (!evento) {
      throw new NotFoundException('Evento', id);
    }

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    const local = await Local.findByPk(evento.localId);
    const response: EventoDetailResponseDto = {
      ...evento,
      local: local ? (local.toJSON() as any) : undefined,
    };

    return res.json(response);
  }

  async create(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // req.body já está validado e tipado como CreateEventoDto
    const dto = req.body as CreateEventoDto;
    
    // Usar service para criar evento (service aplica validações de negócio)
    // TODO: Service deveria receber usuarioId, por enquanto adicionamos manualmente
    const evento = await this.eventoService.create({ ...dto, usuarioId: Number(userId) } as any);
    
    return res.status(201).json(evento);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateEventoDto
    const dto = req.body as UpdateEventoDto;
    
    // Usar service para atualizar evento (service aplica validações de negócio e autorização)
    const updatedEvento = await this.eventoService.update(id, dto);
    
    return res.json(updatedEvento);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover evento
    const deleted = await this.eventoService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Evento', id);
    }

    return res.status(204).send();
  }
}

export default EventoController;
