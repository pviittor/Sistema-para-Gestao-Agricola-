import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { INotaFiscalController } from '../controllers/interfaces/INotaFiscalController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateNotaFiscalDto, UpdateNotaFiscalDto } from '../application/dto/notaFiscal';
import { CreateNotaFiscalCompletoDto } from '../application/dto/notaFiscal/CreateNotaFiscalCompletoDto';
import { UpdateNotaFiscalCompletoDto } from '../application/dto/notaFiscal/UpdateNotaFiscalCompletoDto';
import { asyncHandler } from '../middleware/errorHandler';
import { requirePermission } from '../middleware/authorization';

const router = Router();

// Configuração do multer para upload de arquivos XML NF-e
const xmlStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
    const dir = path.join(process.cwd(), 'uploads', 'xml-nfe', String(tenantId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const xmlUpload = multer({
  storage: xmlStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xml') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .xml são permitidos'));
    }
  },
});

// Helper para resolver controller de forma lazy
const getNotaFiscalController = (): INotaFiscalController => {
  return container.resolve<INotaFiscalController>(TYPES.INotaFiscalController);
};

// ===== Rotas de consulta (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/notasFiscais/por-periodo:
 *   get:
 *     tags:
 *       - Notas Fiscais
 *     summary: Lista notas fiscais por periodo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [entrada, saida]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [rascunho, pendente, autorizada, cancelada, denegada, inutilizada]
 *     responses:
 *       200:
 *         description: Lista de notas fiscais
 */
router.get('/por-periodo', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().findByPeriodo(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/pendentes-movimentacao:
 *   get:
 *     tags:
 *       - Notas Fiscais
 *     summary: Lista notas pendentes de movimentacao de estoque
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [entrada, saida]
 *     responses:
 *       200:
 *         description: Lista de notas pendentes de movimentacao
 */
router.get('/pendentes-movimentacao', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().findPendentesMovimentacao(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/pendentes-financeiro:
 *   get:
 *     tags:
 *       - Notas Fiscais
 *     summary: Lista notas pendentes de geracao financeira
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [entrada, saida]
 *     responses:
 *       200:
 *         description: Lista de notas pendentes de financeiro
 */
router.get('/pendentes-financeiro', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().findPendentesFinanceiro(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/total-por-periodo:
 *   get:
 *     tags:
 *       - Notas Fiscais
 *     summary: Retorna totais agrupados por tipo e periodo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Totais por periodo
 */
router.get('/total-por-periodo', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().totalPorPeriodo(req, res);
}));

// ===== Emissão NF-e e SEFAZ (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/notasFiscais/sefaz/status-servico:
 *   get:
 *     tags:
 *       - SEFAZ
 *     summary: Consulta status do serviço SEFAZ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: uf
 *         schema:
 *           type: string
 *       - in: query
 *         name: ambiente
 *         schema:
 *           type: string
 *           enum: [homologacao, producao]
 *     responses:
 *       200:
 *         description: Status do serviço SEFAZ
 */
router.get('/sefaz/status-servico', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().statusServico(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/contingencia/status:
 *   get:
 *     tags:
 *       - SEFAZ
 *     summary: Consulta status de contingência do tenant
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status da contingência
 */
router.get('/contingencia/status', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().statusContingencia(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/contingencia/ativar:
 *   post:
 *     tags:
 *       - SEFAZ
 *     summary: Ativa modo de contingência
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - justificativa
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [SVC-AN, SVC-RS]
 *               justificativa:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contingência ativada
 */
router.post('/contingencia/ativar', requirePermission('nota_fiscal.contingencia'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().ativarContingencia(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/contingencia/desativar:
 *   post:
 *     tags:
 *       - SEFAZ
 *     summary: Desativa modo de contingência
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contingência desativada
 */
router.post('/contingencia/desativar', requirePermission('nota_fiscal.contingencia'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().desativarContingencia(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/inutilizar-faixa:
 *   post:
 *     tags:
 *       - SEFAZ
 *     summary: Inutiliza faixa de numeração na SEFAZ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cnpj
 *               - numInicial
 *               - numFinal
 *               - justificativa
 *               - certificadoId
 *             properties:
 *               cnpj:
 *                 type: string
 *               serie:
 *                 type: string
 *                 default: '1'
 *               numInicial:
 *                 type: integer
 *               numFinal:
 *                 type: integer
 *               justificativa:
 *                 type: string
 *               certificadoId:
 *                 type: integer
 *               uf:
 *                 type: string
 *               ambiente:
 *                 type: string
 *                 enum: [homologacao, producao]
 *     responses:
 *       200:
 *         description: Faixa inutilizada
 */
router.post('/inutilizar-faixa', requirePermission('nota_fiscal.inutilize'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().inutilizarFaixa(req, res);
}));

// ===== Importação XML e Consulta SEFAZ (ANTES de /:id para evitar conflito) =====

/**
 * @swagger
 * /api/notasFiscais/importar-xml:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Importa NF-e a partir de arquivo XML
 *     description: Recebe arquivo XML de NF-e 4.0 e retorna dados parseados para preenchimento automático
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - arquivo
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: XML parseado com sucesso
 *       400:
 *         description: Arquivo inválido ou XML mal formado
 */
router.post(
  '/importar-xml',
  requirePermission('nota_fiscal.create'),
  xmlUpload.single('arquivo'),
  asyncHandler(async (req, res) => {
    await getNotaFiscalController().importarXml(req, res);
  })
);

/**
 * @swagger
 * /api/notasFiscais/consultar-sefaz:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Consulta NF-e na SEFAZ pela chave de acesso
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chaveAcesso
 *             properties:
 *               chaveAcesso:
 *                 type: string
 *                 description: Chave de acesso de 44 dígitos
 *               certificadoId:
 *                 type: integer
 *                 description: ID do certificado digital (obrigatório)
 *     responses:
 *       200:
 *         description: NF-e consultada com sucesso
 *       400:
 *         description: Chave de acesso inválida ou certificado não encontrado
 */
router.post(
  '/consultar-sefaz',
  requirePermission('nota_fiscal.create'),
  asyncHandler(async (req, res) => {
    await getNotaFiscalController().consultarSefaz(req, res);
  })
);

// ===== CRUD =====

/**
 * @swagger
 * /api/notasFiscais:
 *   get:
 *     tags:
 *       - Notas Fiscais
 *     summary: Lista notas fiscais
 *     description: Retorna uma lista paginada de notas fiscais do tenant atual
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numero da pagina
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de registros por pagina
 *     responses:
 *       200:
 *         description: Lista de notas fiscais
 *       401:
 *         description: Nao autenticado
 *       403:
 *         description: Sem permissao
 */
router.get('/', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().index(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/{id}:
 *   get:
 *     tags:
 *       - Notas Fiscais
 *     summary: Busca nota fiscal por ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Nota fiscal encontrada
 *       404:
 *         description: Nota fiscal nao encontrada
 */
router.get('/:id', requirePermission('nota_fiscal.read'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().show(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/completo:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Cria uma nota fiscal completa com itens em operacao atomica
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotaFiscalCompletoDto'
 *     responses:
 *       201:
 *         description: Nota fiscal criada com sucesso com todos os itens
 *       400:
 *         description: Erro de validacao
 */
router.post(
  '/completo',
  requirePermission('nota_fiscal.create'),
  validateDto(CreateNotaFiscalCompletoDto),
  asyncHandler(async (req, res) => {
    await getNotaFiscalController().createCompleto(req, res);
  })
);

/**
 * @swagger
 * /api/notasFiscais:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Cria uma nova nota fiscal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotaFiscalDto'
 *     responses:
 *       201:
 *         description: Nota fiscal criada com sucesso
 *       400:
 *         description: Erro de validacao
 */
router.post(
  '/',
  requirePermission('nota_fiscal.create'),
  validateDto(CreateNotaFiscalDto),
  asyncHandler(async (req, res) => {
    await getNotaFiscalController().create(req, res);
  })
);

/**
 * @swagger
 * /api/notasFiscais/{id}/completo:
 *   put:
 *     tags:
 *       - Notas Fiscais
 *     summary: Atualiza uma nota fiscal completa com itens em operacao atomica (delete-and-recreate)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotaFiscalCompletoDto'
 *     responses:
 *       200:
 *         description: Nota fiscal e itens atualizados com sucesso
 *       400:
 *         description: Erro de validacao ou status nao permite edicao
 *       404:
 *         description: Nota fiscal nao encontrada
 */
router.put(
  '/:id/completo',
  requirePermission('nota_fiscal.update'),
  validateDtoUpdate(UpdateNotaFiscalCompletoDto),
  asyncHandler(async (req, res) => {
    await getNotaFiscalController().updateCompleto(req, res);
  })
);

/**
 * @swagger
 * /api/notasFiscais/{id}:
 *   put:
 *     tags:
 *       - Notas Fiscais
 *     summary: Atualiza uma nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotaFiscalDto'
 *     responses:
 *       200:
 *         description: Nota fiscal atualizada com sucesso
 *       404:
 *         description: Nota fiscal nao encontrada
 */
router.put(
  '/:id',
  requirePermission('nota_fiscal.update'),
  validateDtoUpdate(UpdateNotaFiscalDto),
  asyncHandler(async (req, res) => {
    await getNotaFiscalController().update(req, res);
  })
);

/**
 * @swagger
 * /api/notasFiscais/{id}:
 *   delete:
 *     tags:
 *       - Notas Fiscais
 *     summary: Remove uma nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Nota fiscal removida com sucesso
 *       404:
 *         description: Nota fiscal nao encontrada
 */
router.delete('/:id', requirePermission('nota_fiscal.delete'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().delete(req, res);
}));

// ===== Acoes =====

/**
 * @swagger
 * /api/notasFiscais/{id}/cancelar:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Cancela uma nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nota fiscal cancelada com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/cancelar', requirePermission('nota_fiscal.cancel'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().cancelar(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/{id}/autorizar:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Autoriza uma nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chave_acesso:
 *                 type: string
 *               protocolo_autorizacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nota fiscal autorizada com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/autorizar', requirePermission('nota_fiscal.authorize'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().autorizar(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/{id}/inutilizar:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Inutiliza uma nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nota fiscal inutilizada com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/inutilizar', requirePermission('nota_fiscal.inutilize'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().inutilizar(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/{id}/movimentar-estoque:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Movimenta estoque a partir da nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estoque movimentado com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/movimentar-estoque', requirePermission('nota_fiscal.stock_move'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().movimentarEstoque(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/{id}/gerar-financeiro:
 *   post:
 *     tags:
 *       - Notas Fiscais
 *     summary: Gera lancamentos financeiros a partir da nota fiscal
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Financeiro gerado com sucesso
 *       400:
 *         description: Erro de regra de negocio
 */
router.post('/:id/gerar-financeiro', requirePermission('nota_fiscal.finance_generate'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().gerarFinanceiro(req, res);
}));

/**
 * @swagger
 * /api/notasFiscais/{id}/emitir:
 *   post:
 *     tags:
 *       - SEFAZ
 *     summary: Emite NF-e/NFC-e (gera XML, assina, transmite para SEFAZ)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               certificadoId:
 *                 type: integer
 *                 description: ID do certificado digital (opcional, usa padrão do tenant)
 *     responses:
 *       200:
 *         description: Resultado da emissão
 *       400:
 *         description: Erro de regra de negócio
 */
router.post('/:id/emitir', requirePermission('nota_fiscal.emit'), asyncHandler(async (req, res) => {
  await getNotaFiscalController().emitir(req, res);
}));

export default router;
