import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAuthController } from '../controllers/interfaces/IAuthController';
import { validateDto } from '../middleware/validation';
import { CreateLoginDto, RefreshTokenDto } from '../application/dto/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Helper para resolver controller de forma lazy
const getAuthController = (): IAuthController => {
  return container.resolve<IAuthController>(TYPES.IAuthController);
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Autentica um usuário
 *     description: Autentica um usuário e retorna token JWT e refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLoginDto'
 *           examples:
 *             login:
 *               summary: Exemplo de login
 *               value:
 *                 email: usuario@example.com
 *                 senha: senha123
 *     responses:
 *       200:
 *         description: Autenticação bem-sucedida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponseDto'
 *             examples:
 *               success:
 *                 summary: Login bem-sucedido
 *                 value:
 *                   user:
 *                     id: 1
 *                     email: usuario@example.com
 *                     nome: João Silva
 *                   token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ...
 *                   refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ...
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  validateDto(CreateLoginDto),
  asyncHandler(async (req, res) => {
    await getAuthController().authenticate(req, res);
  })
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Renova o token JWT
 *     description: Renova o token JWT usando refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenDto'
 *           examples:
 *             refresh:
 *               summary: Exemplo de refresh token
 *               value:
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ...
 *     responses:
 *       200:
 *         description: Tokens renovados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponseDto'
 *             examples:
 *               success:
 *                 summary: Tokens renovados
 *                 value:
 *                   token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ...
 *                   refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ...
 *       401:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh',
  validateDto(RefreshTokenDto),
  asyncHandler(async (req, res) => {
    await getAuthController().refresh(req, res);
  })
);

export default router;
