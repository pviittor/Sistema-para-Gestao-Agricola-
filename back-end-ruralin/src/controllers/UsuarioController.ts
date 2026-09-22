import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario';
import Role from '../models/Role';
import UsuarioHasRole from '../models/UsuarioHasRole';
import UsuarioHasSubUsuario from '../models/UsuarioHasSubUsuario';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IUsuarioController } from './interfaces/IUsuarioController';
import { IUsuarioApplicationService } from '../application/services/usuario/IUsuarioApplicationService';
import { CreateUsuarioDto } from '../application/dto/usuario/CreateUsuarioDto';
import { UpdateUsuarioDto } from '../application/dto/usuario/UpdateUsuarioDto';
import { UsuarioResponseDto, UsuarioDetailResponseDto } from '../application/dto/usuario/UsuarioResponseDto';
import { NotFoundException } from '../core/exceptions';
import { getRequestContext } from '../core/authorization/helpers';

/**
 * Controller responsável pelo gerenciamento de usuários
 * 
 * Este controller atua como camada HTTP, delegando toda a lógica de negócio
 * para o UsuarioApplicationService. Sua responsabilidade é apenas:
 * - Receber requisições HTTP
 * - Chamar Application Service
 * - Retornar respostas HTTP
 */
@Injectable()
export class UsuarioController implements IUsuarioController {
  constructor(
    @Inject(TYPES.IUsuarioApplicationService)
    private usuarioService: IUsuarioApplicationService
  ) {}

  async index(req: Request, res: Response) {
    // Usar service para listar usuários
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    
    const result = await this.usuarioService.list(page, limit);
    
    // Enriquecer com roles e remover subUsuarios
    const usuariosPlain = result.data;
    const userIds = usuariosPlain.map(u => u.id);

    // Buscar todas as associações de roles para os usuários da página
    const usuarioRoles = await UsuarioHasRole.findAll({
      where: {
        usuarioId: userIds
      }
    });

    // Buscar as roles correspondentes
    const roleIds = [...new Set(usuarioRoles.map(ur => ur.roleId))];
    const roles = await Role.findAll({
      where: {
        id: roleIds
      }
    });

    const roleMap = new Map(roles.map(r => [r.id, r]));

    // Agrupar roles por usuário
    const userRolesMap = new Map<number, any[]>();
    usuarioRoles.forEach(ur => {
      const role = roleMap.get(ur.roleId);
      if (role) {
        if (!userRolesMap.has(ur.usuarioId)) {
          userRolesMap.set(ur.usuarioId, []);
        }
        userRolesMap.get(ur.usuarioId)?.push(role);
      }
    });

    // Anexar roles aos usuários
    usuariosPlain.forEach((u: any) => {
      u.roles = userRolesMap.get(u.id) || [];
      // Garantir que subUsuarios seja removido se existir
      delete u.subUsuarios;
    });

    return res.json({
      ...result,
      data: usuariosPlain,
    });
  }

  async show(req: Request, res: Response) {
    const { id } = req.params;
    
    // Usar service para buscar usuário
    const usuario = await this.usuarioService.getById(id);
    
    if (!usuario) {
      throw new NotFoundException('Usuário', id);
    }

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    const usuarioRoles = await UsuarioHasRole.findAll({
      where: { usuarioId: id }
    });

    const roles = await Role.findAll({
      where: {
        id: usuarioRoles.map(ur => ur.roleId)
      }
    });

    const subUsuariosLinks = await UsuarioHasSubUsuario.findAll({
      where: { usuarioId: id }
    });
    
    const subUsuarios = await Usuario.findAll({
      where: {
        id: subUsuariosLinks.map(link => link.subUsuarioId)
      },
      attributes: { exclude: ['senha'] }
    });

    const response: UsuarioDetailResponseDto = {
      ...usuario,
      roles: roles.map(r => r.toJSON()),
      subUsuarios: subUsuarios.map(u => u.toJSON() as unknown as UsuarioResponseDto),
    };

    return res.json(response);
  }

  async create(req: Request, res: Response) {
    // req.body já está validado e tipado como CreateUsuarioDto
    const dto = req.body as CreateUsuarioDto;
    
    // Usar service para criar usuário (service aplica hash de senha e validações)
    const usuario = await this.usuarioService.create(dto);
    
    // Obter tenantId do contexto
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    
    if (!tenantId) {
      throw new NotFoundException('Tenant não identificado');
    }

    // Criar associações de roles (lógica específica de relacionamentos)
    // TODO: Mover para o Application Service em futura refatoração
    const { roleIds } = dto;
    if (roleIds && Array.isArray(roleIds)) {
      await Promise.all(roleIds.map(roleId => 
        UsuarioHasRole.create({
          tenantId,
          usuarioId: usuario.id,
          roleId
        })
      ));
    }
    
    return res.status(201).json(usuario);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    // req.body já está validado e tipado como UpdateUsuarioDto
    const dto = req.body as UpdateUsuarioDto & { subUsuarios?: any[] };
    
    // Usar service para atualizar usuário (service aplica hash de senha e validações)
    const usuario = await this.usuarioService.update(id, dto);

    // Obter tenantId do contexto
    const context = getRequestContext();
    const tenantId = context?.getTenantId();
    
    if (!tenantId) {
      throw new NotFoundException('Tenant não identificado');
    }

    // Atualizar roles se fornecido (lógica específica de relacionamentos)
    // TODO: Mover para o Application Service em futura refatoração
    const { roleIds } = dto;
    if (roleIds && Array.isArray(roleIds)) {
      // Remove associações antigas
      await UsuarioHasRole.destroy({ where: { usuarioId: id } });
      
      // Cria novas associações
      await Promise.all(roleIds.map(roleId => 
        UsuarioHasRole.create({
          tenantId,
          usuarioId: Number(id),
          roleId
        })
      ));
    }

    // Atualizar Sub-usuários (lógica específica de relacionamentos)
    // TODO: Mover para o Application Service em futura refatoração
    const { subUsuarios } = dto;
    if (subUsuarios && Array.isArray(subUsuarios)) {
        // 1. Get existing links
        const existingLinks = await UsuarioHasSubUsuario.findAll({ where: { usuarioId: id } });
        const existingSubUserIds = existingLinks.map(link => link.subUsuarioId);
        
        // 2. Separate incoming into new (no id) and existing (has id)
        const incomingIds = subUsuarios.filter((u: any) => u.id).map((u: any) => u.id);
        
        // 3. Delete removed users
        const idsToDelete = existingSubUserIds.filter(id => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
            await UsuarioHasSubUsuario.destroy({ where: { usuarioId: id, subUsuarioId: idsToDelete } });
            // Also delete the user records to prevent orphans
             await Usuario.destroy({ where: { id: idsToDelete } });
        }

        // 4. Update or Create
        for (const sub of subUsuarios) {
            if (sub.id) {
                // Update existing
                if (existingSubUserIds.includes(sub.id)) {
                    const subUser = await Usuario.findByPk(sub.id);
                    if (subUser) {
                         const { senha: subSenha, ...subRest } = sub;
                         let subUpdateData: any = { ...subRest };
                         if (subSenha) {
                             subUpdateData.senha = await bcrypt.hash(subSenha, 8);
                         }
                         await subUser.update(subUpdateData);
                    }
                }
            } else {
                // Create new
                const { senha: subSenha, ...subRest } = sub;
                let subUsuarioData: any = { ...subRest };
                if (subSenha) {
                    subUsuarioData.senha = await bcrypt.hash(subSenha, 8);
                } else {
                    subUsuarioData.senha = await bcrypt.hash('Mudar@123', 8);
                }
                
                // Adicionar tenantId ao subUsuario se não estiver presente
                if (!subUsuarioData.tenantId && tenantId) {
                  subUsuarioData.tenantId = tenantId;
                }
                
                const novoSubUsuario = await Usuario.create(subUsuarioData);
                await UsuarioHasSubUsuario.create({
                    usuarioId: Number(id),
                    subUsuarioId: novoSubUsuario.id
                });
            }
        }
      }
    
    // Retornar usuário atualizado (já vem como DTO do service)
    return res.json(usuario);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    // Remover associações de roles primeiro (lógica específica de relacionamentos)
    // TODO: Mover para o Application Service em futura refatoração
    await UsuarioHasRole.destroy({ where: { usuarioId: id } });

    // Remover sub-usuários e suas associações
    const subUsersLinks = await UsuarioHasSubUsuario.findAll({ where: { usuarioId: id } });
    const subUserIds = subUsersLinks.map(link => link.subUsuarioId);
    
    // Delete associations
    await UsuarioHasSubUsuario.destroy({ where: { usuarioId: id } });
    
    // Delete sub-users
    if (subUserIds.length > 0) {
        await Usuario.destroy({ where: { id: subUserIds } });
    }
    
    // Also check if this user is a sub-user of someone else (reverse link)
    await UsuarioHasSubUsuario.destroy({ where: { subUsuarioId: id } });

    // Usar service para remover usuário
    const deleted = await this.usuarioService.delete(id);
    
    if (!deleted) {
      throw new NotFoundException('Usuário', id);
    }
    
    return res.status(204).send();
  }

  async me(req: Request, res: Response) {
    const userId = req.userId;

    if (!userId) {
      throw new NotFoundException('Usuário');
    }

    // Usar service para buscar usuário
    const user = await this.usuarioService.getById(userId);

    if (!user) {
      throw new NotFoundException('Usuário', userId);
    }

    // Enriquecer com relacionamentos (lógica específica de apresentação)
    const usuarioRoles = await UsuarioHasRole.findAll({
      where: { usuarioId: userId }
    });

    const roles = await Role.findAll({
      where: {
        id: usuarioRoles.map(ur => ur.roleId)
      }
    });

    // Buscar sub-usuários
    const subUsuariosLinks = await UsuarioHasSubUsuario.findAll({
      where: { usuarioId: userId }
    });
    
    const subUsuarios = await Usuario.findAll({
      where: {
        id: subUsuariosLinks.map(link => link.subUsuarioId)
      },
      attributes: { exclude: ['senha'] }
    });

    const response: UsuarioDetailResponseDto = {
      ...user,
      roles: roles.map(r => r.toJSON()),
      subUsuarios: subUsuarios.map(u => u.toJSON() as unknown as UsuarioResponseDto),
    };

    return res.json(response);
  }
}

export default UsuarioController;
