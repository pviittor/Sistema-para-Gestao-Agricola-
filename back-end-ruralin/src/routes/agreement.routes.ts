import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IAgreementController } from '../controllers/interfaces/IAgreementController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { CreateAgreementDto } from '../application/dto/agreement/CreateAgreementDto';
import { CreateAgreementCompletoDto } from '../application/dto/agreement/CreateAgreementCompletoDto';
import { UpdateAgreementDto } from '../application/dto/agreement/UpdateAgreementDto';
import { UpdateAgreementCompletoDto } from '../application/dto/agreement/UpdateAgreementCompletoDto';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const getController = (): IAgreementController => {
  return container.resolve<IAgreementController>(TYPES.IAgreementController);
};

// List all agreements
router.get('/', asyncHandler((req, res) => getController().index(req, res)));

// Find by fazenda
router.get('/fazenda/:fazendaId', asyncHandler((req, res) => getController().findByFazenda(req, res)));

// Find by type
router.get('/tipo/:agreementType', asyncHandler((req, res) => getController().findByType(req, res)));

// Find by field (talhão)
router.get('/talhao/:fieldId', asyncHandler((req, res) => getController().findByField(req, res)));

// Find active by period
router.get('/periodo-ativo', asyncHandler((req, res) => getController().findActiveByPeriod(req, res)));

// Get by ID
router.get('/:id', asyncHandler((req, res) => getController().show(req, res)));

// Create completo (before plain create)
router.post('/completo', validateDto(CreateAgreementCompletoDto), asyncHandler((req, res) => getController().createCompleto(req, res)));

// Create
router.post('/', validateDto(CreateAgreementDto), asyncHandler((req, res) => getController().create(req, res)));

// Update completo
router.put('/:id/completo', validateDtoUpdate(UpdateAgreementCompletoDto), asyncHandler((req, res) => getController().updateCompleto(req, res)));

// Update
router.put('/:id', validateDtoUpdate(UpdateAgreementDto), asyncHandler((req, res) => getController().update(req, res)));

// Delete
router.delete('/:id', asyncHandler((req, res) => getController().delete(req, res)));

export default router;
