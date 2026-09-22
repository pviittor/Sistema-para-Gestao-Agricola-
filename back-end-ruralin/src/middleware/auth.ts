/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario";
import UsuarioHasSubUsuario from "../models/UsuarioHasSubUsuario";

enum UserType {
  GOD = "GOD",
  CONSULTOR = "CONSULTOR",
  ROOT = "ROOT",
  CLIENT = "CLIENT",
}

interface TokenPayload {
  id: number;
  iat: number;
  exp: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const [, token] = authorization.split(" ");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const { id } = decoded as TokenPayload;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(401).json({ error: "User not found" });
    }

    let userId: number;
    let tenantId: number | undefined;
    let usuariosRoot: UsuarioHasSubUsuario[] | null = null;
    
    // GOD: acesso total, sem tenant
    if (usuario.tipo === UserType.GOD) {
      userId = usuario.id;
      tenantId = undefined; // GOD não tem tenant
    }
    // CONSULTOR: acesso à consultoria, sem tenant específico
    else if (usuario.tipo === UserType.CONSULTOR) {
      userId = usuario.id;
      tenantId = undefined; // CONSULTOR não tem tenant específico
    }
    // ROOT: acesso ao tenant
    else if (usuario.tipo === UserType.ROOT) {
      userId = usuario.id;
      tenantId = usuario.tenantId || undefined;
    }
    // CLIENT: acesso via ROOT associado
    else if (usuario.tipo === UserType.CLIENT) {
      usuariosRoot = await UsuarioHasSubUsuario.findAll({
        where: {
          subUsuarioId: id,
        },
      });
      if (!usuariosRoot) {
        return res.status(401).json({ error: "User root not found" });
      }
      if (usuariosRoot.length === 0) {
        return res.status(401).json({ error: "User root not found" });
      }
      if (usuariosRoot.length > 1) {
        return res.status(401).json({ error: "Multiple user roots found" });
      }

      userId = usuariosRoot[0].usuarioId;
      
      // Buscar o tenantId do usuário ROOT associado
      const usuarioRoot = await Usuario.findByPk(userId, {
        attributes: ['id', 'tenantId'],
      });
      tenantId = usuarioRoot?.tenantId || undefined;
    } else {
      return res.status(401).json({ error: "Invalid user type" });
    }

    // Definir userId no Request
    (req as any).userId = userId;

    // Atualizar RequestContext se disponível
    if (req.context) {
      req.context.setUserId(userId);
      
      // Se o usuário tem tenantId, definir no RequestContext também
      // Isso permite que o tenantId esteja disponível imediatamente após autenticação
      if (tenantId) {
        req.context.setTenantId(tenantId);
      }
      
      // Se o usuário é CONSULTOR, definir consultoriaId no RequestContext
      if (usuario.tipo === UserType.CONSULTOR && usuario.consultoriaId) {
        req.context.setConsultoriaId(usuario.consultoriaId);
      }
    }

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalid" });
  }
};
