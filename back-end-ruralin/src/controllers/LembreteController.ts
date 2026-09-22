import { Request, Response } from "express";
import LembreteDataHora from "../models/LembreteDataHora";
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { ILembreteController } from './interfaces/ILembreteController';
import { ILembreteApplicationService } from '../application/services/lembrete/ILembreteApplicationService';
import { CreateLembreteDto } from '../application/dto/lembrete/CreateLembreteDto';
import { UpdateLembreteDto } from '../application/dto/lembrete/UpdateLembreteDto';
import { LembreteResponseDto, LembreteDetailResponseDto } from '../application/dto/lembrete/LembreteResponseDto';
import { NotFoundException, ForbiddenException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de lembretes
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o LembreteApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Gerenciar relacionamentos LembreteDataHora (lógica específica de relacionamentos)
 */
@Injectable()
export class LembreteController implements ILembreteController {
  constructor(
    @Inject(TYPES.ILembreteApplicationService)
    private lembreteService: ILembreteApplicationService
  ) {}

  async index(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // Usar service para buscar lembretes do usuário
    const lembretes = await this.lembreteService.findByUsuario(Number(userId));

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    const lembretesComDataHora: LembreteDetailResponseDto[] = await Promise.all(
      lembretes.map(async (lembrete) => {
        const dataHoras = await LembreteDataHora.findAll({
          where: { lembreteId: lembrete.id },
        });
        return {
          ...lembrete,
          lembrete_data_hora: dataHoras.map(dh => dh.toJSON() as any),
        };
      })
    );

    return res.json(lembretesComDataHora);
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar lembrete
    const lembrete = await this.lembreteService.getById(id);

    if (!lembrete) {
      throw new NotFoundException('Lembrete', id);
    }

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    const dataHoras = await LembreteDataHora.findAll({
      where: { lembreteId: Number(id) },
    });

    const response: LembreteDetailResponseDto = {
      ...lembrete,
      lembrete_data_hora: dataHoras.map(dh => dh.toJSON() as any) as any,
    };

    return res.json(response);
  }

  async create(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // req.body já está validado e tipado como CreateLembreteDto
    const dto = req.body as CreateLembreteDto;
    const { desc_simples, desc_completa, lembrete_data_hora } = dto;

    // Usar service para criar lembrete (service aplica validações de negócio)
    // TODO: Service deveria receber usuarioId, por enquanto adicionamos manualmente
    const lembrete = await this.lembreteService.create({ desc_simples, desc_completa } as any);

    // Criar relacionamentos LembreteDataHora (lógica específica de relacionamentos)
    // TODO: Mover para o Application Service em futura refatoração
    if (lembrete_data_hora) {
      if (Array.isArray(lembrete_data_hora)) {
        const items = lembrete_data_hora.map((item) => {
          const itemData: any = {
            lembreteId: lembrete.id,
            horario: item.horario,
          };
          if (item.dia !== undefined) itemData.dia = item.dia;
          if (item.data !== undefined) itemData.data = item.data;
          return itemData;
        });
        await LembreteDataHora.bulkCreate(items as any);
      } else {
        const dataHora = lembrete_data_hora as any;
        const itemData: any = {
          lembreteId: lembrete.id,
          horario: dataHora.horario,
        };
        if (dataHora.dia !== undefined) itemData.dia = dataHora.dia;
        if (dataHora.data !== undefined) itemData.data = dataHora.data;
        await LembreteDataHora.create(itemData);
      }
    }

    // Enriquecer resposta com relacionamentos
    const dataHoras = await LembreteDataHora.findAll({
      where: { lembreteId: lembrete.id },
    });

    const response: LembreteDetailResponseDto = {
      ...lembrete,
      lembrete_data_hora: dataHoras.map(dh => dh.toJSON() as any) as any,
    };

    return res.status(201).json(response);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateLembreteDto
    const dto = req.body as UpdateLembreteDto;
    const { desc_simples, desc_completa, lembrete_data_hora } = dto;

    // Usar service para atualizar lembrete (service aplica validações de negócio e autorização)
    const lembrete = await this.lembreteService.update(id, { desc_simples, desc_completa });

    // Atualizar datas/horários se fornecidos (lógica específica de relacionamentos)
    // TODO: Mover para o Application Service em futura refatoração
    if (lembrete_data_hora) {
      await LembreteDataHora.destroy({ where: { lembreteId: id } });

      if (Array.isArray(lembrete_data_hora)) {
        const items = lembrete_data_hora.map((item: any) => {
          const itemData: any = {
            lembreteId: Number(id),
            horario: item.horario,
          };
          if (item.dia !== undefined) itemData.dia = item.dia;
          if (item.data !== undefined) itemData.data = item.data;
          return itemData;
        });
        await LembreteDataHora.bulkCreate(items);
      } else {
        const itemData: any = {
          lembreteId: Number(id),
        };
        const dataHora = lembrete_data_hora as any;
        if (dataHora.horario !== undefined) itemData.horario = dataHora.horario;
        if (dataHora.dia !== undefined) itemData.dia = dataHora.dia;
        if (dataHora.data !== undefined) itemData.data = dataHora.data;
        await LembreteDataHora.create(itemData);
      }
    }

    // Enriquecer resposta com relacionamentos
    const dataHoras = await LembreteDataHora.findAll({
      where: { lembreteId: Number(id) },
    });

    const response: LembreteDetailResponseDto = {
      ...lembrete,
      lembrete_data_hora: dataHoras.map(dh => dh.toJSON() as any),
    };

    return res.json(response);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover lembrete
    const deleted = await this.lembreteService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Lembrete', id);
    }

    return res.status(204).send();
  }
}

export default LembreteController;
