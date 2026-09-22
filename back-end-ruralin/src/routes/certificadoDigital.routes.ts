import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { ICertificadoDigitalController } from '../controllers/interfaces/ICertificadoDigitalController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateCertificadoDigitalDto, UpdateCertificadoDigitalDto } from '../application/dto/certificadoDigital';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Helper para resolver controller de forma lazy
const getCertificadoDigitalController = (): ICertificadoDigitalController => {
  return container.resolve<ICertificadoDigitalController>(TYPES.ICertificadoDigitalController);
};

// Configuração do multer para upload de arquivos .pfx/.p12
const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const dir = path.join(process.cwd(), 'uploads', 'certificados', String(tenantId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pfx' || ext === '.p12') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .pfx e .p12 são aceitos'));
    }
  },
});

/**
 * @swagger
 * /api/certificadosDigitais:
 *   get:
 *     tags:
 *       - Certificados Digitais
 *     summary: Lista certificados digitais
 *     description: Retorna uma lista paginada de certificados digitais do tenant atual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de registros por página
 *     responses:
 *       200:
 *         description: Lista de certificados digitais
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.get('/', requirePermission('certificado_digital.read'), asyncHandler(async (req, res) => {
  await getCertificadoDigitalController().index(req, res);
}));

/**
 * @swagger
 * /api/certificadosDigitais/upload:
 *   post:
 *     tags:
 *       - Certificados Digitais
 *     summary: Upload de arquivo .pfx/.p12
 *     description: Faz upload de um arquivo de certificado digital
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Arquivo enviado com sucesso
 *       400:
 *         description: Arquivo inválido
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/upload',
  requirePermission('certificado_digital.create'),
  upload.single('arquivo'),
  asyncHandler(async (req, res) => {
    await getCertificadoDigitalController().upload(req, res);
  })
);

/**
 * @swagger
 * /api/certificadosDigitais/{id}:
 *   get:
 *     tags:
 *       - Certificados Digitais
 *     summary: Busca por ID
 *     description: Retorna um certificado digital específico por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do certificado digital
 *     responses:
 *       200:
 *         description: Certificado digital encontrado
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Certificado digital não encontrado
 */
router.get('/:id', requirePermission('certificado_digital.read'), asyncHandler(async (req, res) => {
  await getCertificadoDigitalController().show(req, res);
}));

/**
 * @swagger
 * /api/certificadosDigitais/{id}/set-padrao:
 *   post:
 *     tags:
 *       - Certificados Digitais
 *     summary: Define como padrão
 *     description: Define um certificado digital como padrão do tenant
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do certificado digital
 *     responses:
 *       200:
 *         description: Certificado definido como padrão
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Certificado digital não encontrado
 */
router.post('/:id/set-padrao', requirePermission('certificado_digital.update'), asyncHandler(async (req, res) => {
  await getCertificadoDigitalController().setPadrao(req, res);
}));

/**
 * @swagger
 * /api/certificadosDigitais:
 *   post:
 *     tags:
 *       - Certificados Digitais
 *     summary: Cria um novo certificado digital
 *     description: Cria um novo certificado digital no tenant atual
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCertificadoDigitalDto'
 *     responses:
 *       201:
 *         description: Certificado digital criado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 */
router.post(
  '/',
  requirePermission('certificado_digital.create'),
  validateDto(CreateCertificadoDigitalDto),
  asyncHandler(async (req, res) => {
    await getCertificadoDigitalController().create(req, res);
  })
);

/**
 * @swagger
 * /api/certificadosDigitais/{id}:
 *   put:
 *     tags:
 *       - Certificados Digitais
 *     summary: Atualiza um certificado digital
 *     description: Atualiza um certificado digital existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do certificado digital
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCertificadoDigitalDto'
 *     responses:
 *       200:
 *         description: Certificado digital atualizado com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Certificado digital não encontrado
 */
router.put(
  '/:id',
  requirePermission('certificado_digital.update'),
  validateDtoUpdate(UpdateCertificadoDigitalDto),
  asyncHandler(async (req, res) => {
    await getCertificadoDigitalController().update(req, res);
  })
);

/**
 * @swagger
 * /api/certificadosDigitais/{id}:
 *   delete:
 *     tags:
 *       - Certificados Digitais
 *     summary: Remove um certificado digital
 *     description: Remove um certificado digital do sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do certificado digital
 *     responses:
 *       204:
 *         description: Certificado digital removido com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Certificado digital não encontrado
 */
router.delete('/:id', requirePermission('certificado_digital.delete'), asyncHandler(async (req, res) => {
  await getCertificadoDigitalController().delete(req, res);
}));

export default router;
