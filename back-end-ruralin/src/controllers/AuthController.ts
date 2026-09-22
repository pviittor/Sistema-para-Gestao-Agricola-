import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Injectable, Inject } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAuthController } from './interfaces/IAuthController';
import { IUsuarioRepository } from '../infrastructure/repository/IUsuarioRepository';
import { CreateLoginDto } from '../application/dto/auth/CreateLoginDto';
import { RefreshTokenDto } from '../application/dto/auth/RefreshTokenDto';
import { AuthResponseDto, RefreshResponseDto } from '../application/dto/auth/AuthResponseDto';
import { UnauthorizedException } from '../core/exceptions';

/**
 * Controller responsável pela autenticação de usuários
 * 
 * Implementa autenticação JWT com refresh tokens.
 * Usa UsuarioRepository para acesso a dados, seguindo o padrão Repository.
 */
@Injectable()
export class AuthController implements IAuthController {
  /**
   * Construtor do AuthController
   * 
   * @param usuarioRepository - Repositório de usuários injetado via DI
   */
  constructor(
    @Inject(TYPES.IUsuarioRepository)
    private usuarioRepository: IUsuarioRepository
  ) {}

  /**
   * Autentica um usuário e retorna token JWT
   * 
   * @param req - Request com CreateLoginDto no body (validado pelo middleware)
   * @param res - Response do Express
   */
  async authenticate(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como CreateLoginDto
    const dto = req.body as CreateLoginDto;

    // Usar repositório ao invés de acesso direto ao Sequelize
    // Tenta buscar por email primeiro, depois por username
    const user = await this.usuarioRepository.findByEmail(dto.email) ||
                 await this.usuarioRepository.findByUsername(dto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.senha) {
      throw new UnauthorizedException('Usuário não possui senha configurada');
    }

    const isValidPassword = await bcrypt.compare(dto.senha, user.senha);

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
      expiresIn: '60m',
    });

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: '7d' }
    );

    // In a real application, you might want to store refresh tokens in the database
    // to allow invalidating them.

    const response: AuthResponseDto = {
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        ...(user.apiUrl && { apiUrl: user.apiUrl }),
      },
      token,
      refreshToken,
    };

    res.json(response);
  }

  /**
   * Renova o token JWT usando refresh token
   * 
   * @param req - Request com RefreshTokenDto no body (validado pelo middleware)
   * @param res - Response do Express
   */
  async refresh(req: Request, res: Response): Promise<void> {
    // req.body já está validado e tipado como RefreshTokenDto
    const dto = req.body as RefreshTokenDto;

    try {
      const decoded = jwt.verify(
        dto.refreshToken,
        process.env.REFRESH_SECRET as string
      ) as { id: number };

      // Usar repositório ao invés de acesso direto ao Sequelize
      const user = await this.usuarioRepository.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const newToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
        expiresIn: '15m',
      });

      const newRefreshToken = jwt.sign(
        { id: user.id },
        process.env.REFRESH_SECRET as string,
        { expiresIn: '7d' }
      );

      const response: RefreshResponseDto = {
        token: newToken,
        refreshToken: newRefreshToken,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}

export default AuthController;
