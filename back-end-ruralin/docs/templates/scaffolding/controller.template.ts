/**
 * TEMPLATE: Controller Implementation
 * 
 * Variáveis de substituição:
 * - {{EntityName}}: Nome da entidade em PascalCase
 * - {{entityName}}: Nome da entidade em camelCase
 */

import { Request, Response } from 'express';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { I{{EntityName}}Controller } from './interfaces/I{{EntityName}}Controller';
import { I{{EntityName}}ApplicationService } from '../application/services/{{entityName}}/I{{EntityName}}ApplicationService';
import { Create{{EntityName}}Dto } from '../application/dto/{{entityName}}/Create{{EntityName}}Dto';
import { Update{{EntityName}}Dto } from '../application/dto/{{entityName}}/Update{{EntityName}}Dto';
import { {{EntityName}}ResponseDto } from '../application/dto/{{entityName}}/{{EntityName}}ResponseDto';
import { NotFoundException } from '../core/exceptions/NotFoundException';

/**
 * Controller responsável pelo gerenciamento de {{entityName}}
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o {{EntityName}}ApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 * - Enriquecer com relacionamentos quando necessário
 */
@Injectable()
export class {{EntityName}}Controller implements I{{EntityName}}Controller {
  constructor(
    @Inject(TYPES.I{{EntityName}}ApplicationService)
    private {{entityName}}Service: I{{EntityName}}ApplicationService
  ) {}

  /**
   * Lista todas as {{entityName}}s com paginação
   */
  async index(req: Request, res: Response): Promise<void> {
    // TODO: Extrair parâmetros de paginação da query string
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    // TODO: Chamar service para listar
    const result = await this.{{entityName}}Service.list(page, limit);

    // TODO: Enriquecer com relacionamentos se necessário
    // Exemplo:
    // const enriched = await Promise.all(
    //   result.data.map(async (item) => {
    //     // Buscar relacionamentos
    //     return { ...item, related: await getRelated(item.id) };
    //   })
    // );

    res.json(result);
  }

  /**
   * Busca uma {{entityName}} por ID
   */
  async show(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    // TODO: Validar ID
    const {{entityName}}Id = parseInt(id, 10);
    if (isNaN({{entityName}}Id)) {
      throw new NotFoundException('{{EntityName}}', id);
    }
    
    // TODO: Chamar service para buscar
    const {{entityName}} = await this.{{entityName}}Service.findById({{entityName}}Id);
    
    if (!{{entityName}}) {
      throw new NotFoundException('{{EntityName}}', id);
    }

    // TODO: Enriquecer com relacionamentos se necessário

    res.json({{entityName}});
  }

  /**
   * Cria uma nova {{entityName}}
   */
  async create(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como Create{{EntityName}}Dto
    const dto = req.body as Create{{EntityName}}Dto;
    
    // TODO: Chamar service para criar (service aplica validações de negócio)
    const {{entityName}} = await this.{{entityName}}Service.create(dto);
    
    res.status(201).json({{entityName}});
  }

  /**
   * Atualiza uma {{entityName}} existente
   */
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    // req.body já está validado e tipado como Update{{EntityName}}Dto
    const dto = req.body as Update{{EntityName}}Dto;
    
    // TODO: Validar ID
    const {{entityName}}Id = parseInt(id, 10);
    if (isNaN({{entityName}}Id)) {
      throw new NotFoundException('{{EntityName}}', id);
    }
    
    // TODO: Chamar service para atualizar (service aplica validações de negócio e autorização)
    const updated{{EntityName}} = await this.{{entityName}}Service.update({{entityName}}Id, dto);
    
    res.json(updated{{EntityName}});
  }

  /**
   * Remove uma {{entityName}}
   */
  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    // TODO: Validar ID
    const {{entityName}}Id = parseInt(id, 10);
    if (isNaN({{entityName}}Id)) {
      throw new NotFoundException('{{EntityName}}', id);
    }
    
    // TODO: Chamar service para remover
    await this.{{entityName}}Service.delete({{entityName}}Id);

    res.status(204).send();
  }
}

export default {{EntityName}}Controller;
