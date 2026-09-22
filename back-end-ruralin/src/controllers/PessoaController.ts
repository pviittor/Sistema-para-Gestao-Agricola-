import { Request, Response } from 'express';
import Usuario from '../models/Usuario';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IPessoaController } from './interfaces/IPessoaController';
import { IPessoaApplicationService } from '../application/services/pessoa/IPessoaApplicationService';
import { CreatePessoaDto } from '../application/dto/pessoa/CreatePessoaDto';
import { UpdatePessoaDto } from '../application/dto/pessoa/UpdatePessoaDto';
import { PessoaResponseDto, PessoaDetailResponseDto } from '../application/dto/pessoa/PessoaResponseDto';
import { NotFoundException } from '../core/exceptions';

/**
 * Controller responsável pelo gerenciamento de pessoas
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o PessoaApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Enriquecer com relacionamentos quando necessário
 */
@Injectable()
export class PessoaController implements IPessoaController {
  constructor(
    @Inject(TYPES.IPessoaApplicationService)
    private pessoaService: IPessoaApplicationService
  ) {}

  async index(req: Request, res: Response) {
    // Usar service para listar pessoas
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.pessoaService.list(page, limit);

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    // Buscar usuários criadores para enriquecer resposta
    const pessoasComUsuario: PessoaDetailResponseDto[] = await Promise.all(
      result.data.map(async (pessoa) => {
        const usuario = await Usuario.findByPk(pessoa.usercreation, {
          attributes: ['id', 'nome', 'email'],
        });
        return {
          ...pessoa,
          usuarioCriador: usuario ? (usuario.toJSON() as any) : undefined,
        };
      })
    );

    return res.json({
      ...result,
      data: pessoasComUsuario,
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar pessoa
    const pessoa = await this.pessoaService.getById(id);
    
    if (!pessoa) {
      throw new NotFoundException('Pessoa', id);
    }

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    const usuario = await Usuario.findByPk(pessoa.usercreation, {
      attributes: ['id', 'nome', 'email'],
    });
    const response: PessoaDetailResponseDto = {
      ...pessoa,
      usuarioCriador: usuario ? (usuario.toJSON() as any) : undefined,
    };

    return res.json(response);
  }

  async create(req: Request, res: Response) {
    // req.body já está validado e tipado como CreatePessoaDto
    const dto = req.body as CreatePessoaDto;
    
    // Usar service para criar pessoa (service aplica validações de negócio)
    const pessoa = await this.pessoaService.create(dto);
    
    return res.status(201).json(pessoa);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdatePessoaDto
    const dto = req.body as UpdatePessoaDto;
    
    // Usar service para atualizar pessoa (service aplica validações de negócio e autorização)
    const updatedPessoa = await this.pessoaService.update(id, dto);
    
    return res.json(updatedPessoa);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para remover pessoa
    const deleted = await this.pessoaService.delete(id);

    if (!deleted) {
      throw new NotFoundException('Pessoa', id);
    }

    return res.status(204).send();
  }
}

export default PessoaController;
