import { Router } from 'express';
import { container } from '../core/di';
import { TYPES } from '../core/di/types';
import { IFluxoCaixaController } from '../controllers/interfaces/IFluxoCaixaController';
import { IFluxoCaixaConfiguracaoController } from '../controllers/interfaces/IFluxoCaixaConfiguracaoController';
import { IFluxoCaixaSimulacaoController } from '../controllers/interfaces/IFluxoCaixaSimulacaoController';
import { validateDto, validateDtoUpdate } from '../middleware/validation';
import { UpdateFluxoCaixaConfiguracaoDto } from '../application/dto/fluxoCaixaConfiguracao';
import { CreateFluxoCaixaSimulacaoDto, UpdateFluxoCaixaSimulacaoDto, FluxoCaixaSimulacaoItemSemIdDto, CreateFluxoCaixaSimulacaoCompletoDto } from '../application/dto/fluxoCaixaSimulacao';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

const getFluxoCaixaController = (): IFluxoCaixaController => {
  return container.resolve<IFluxoCaixaController>(TYPES.IFluxoCaixaController);
};

const getConfiguracaoController = (): IFluxoCaixaConfiguracaoController => {
  return container.resolve<IFluxoCaixaConfiguracaoController>(TYPES.IFluxoCaixaConfiguracaoController);
};

const getSimulacaoController = (): IFluxoCaixaSimulacaoController => {
  return container.resolve<IFluxoCaixaSimulacaoController>(TYPES.IFluxoCaixaSimulacaoController);
};

// ========================================
// Fluxo de Caixa — Cálculos
// ========================================

// Consolidado (realizado + projetado)
router.get('/consolidado', asyncHandler((req, res) => getFluxoCaixaController().consolidado(req, res)));

// Apenas realizado
router.get('/realizado', asyncHandler((req, res) => getFluxoCaixaController().realizado(req, res)));

// Apenas projetado
router.get('/projetado', asyncHandler((req, res) => getFluxoCaixaController().projetado(req, res)));

// Saldos por conta bancária
router.get('/saldos-por-conta', asyncHandler((req, res) => getFluxoCaixaController().saldosPorConta(req, res)));

// Alertas de saldo negativo/crítico
router.get('/alertas', asyncHandler((req, res) => getFluxoCaixaController().alertas(req, res)));

// Autocomplete de lançamentos projetados (para simulação)
router.get('/autocomplete-projetados', asyncHandler((req, res) => getFluxoCaixaController().autocompleteProjetados(req, res)));

// ========================================
// Configuração do tenant
// ========================================

// Buscar configuração (ou defaults)
router.get('/configuracao', asyncHandler((req, res) => getConfiguracaoController().getByTenant(req, res)));

// Criar ou atualizar configuração (upsert)
router.put('/configuracao', validateDtoUpdate(UpdateFluxoCaixaConfiguracaoDto), asyncHandler((req, res) => getConfiguracaoController().upsertByTenant(req, res)));

// ========================================
// Simulações
// ========================================

// Listar simulações do usuário
router.get('/simulacoes', asyncHandler((req, res) => getSimulacaoController().index(req, res)));

// Criar simulação com itens (completo) — ANTES da rota simples
router.post('/simulacoes/completo', validateDto(CreateFluxoCaixaSimulacaoCompletoDto), asyncHandler((req, res) => getSimulacaoController().createCompleto(req, res)));

// Criar simulação sem itens
router.post('/simulacoes', validateDto(CreateFluxoCaixaSimulacaoDto), asyncHandler((req, res) => getSimulacaoController().create(req, res)));

// Buscar simulação por ID (com itens)
router.get('/simulacoes/:id', asyncHandler((req, res) => getSimulacaoController().show(req, res)));

// Atualizar metadados da simulação
router.put('/simulacoes/:id', validateDtoUpdate(UpdateFluxoCaixaSimulacaoDto), asyncHandler((req, res) => getSimulacaoController().update(req, res)));

// Remover simulação
router.delete('/simulacoes/:id', asyncHandler((req, res) => getSimulacaoController().delete(req, res)));

// Calcular resultado da simulação
router.post('/simulacoes/:id/calcular', asyncHandler((req, res) => getSimulacaoController().calcular(req, res)));

// ========================================
// Itens de simulação
// ========================================

// Adicionar item
router.post('/simulacoes/:id/itens', validateDto(FluxoCaixaSimulacaoItemSemIdDto), asyncHandler((req, res) => getSimulacaoController().addItem(req, res)));

// Atualizar item
router.put('/simulacoes/:id/itens/:itemId', validateDtoUpdate(FluxoCaixaSimulacaoItemSemIdDto), asyncHandler((req, res) => getSimulacaoController().updateItem(req, res)));

// Remover item
router.delete('/simulacoes/:id/itens/:itemId', asyncHandler((req, res) => getSimulacaoController().deleteItem(req, res)));

export default router;
