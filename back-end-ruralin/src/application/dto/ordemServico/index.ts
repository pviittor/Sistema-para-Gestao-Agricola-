// DTOs principais
export { CreateOrdemServicoDto } from './CreateOrdemServicoDto';
export { UpdateOrdemServicoDto } from './UpdateOrdemServicoDto';
export { OrdemServicoResponseDto } from './OrdemServicoResponseDto';
export type {} from './OrdemServicoResponseDto';
export { CreateOrdemServicoCompletoDto } from './CreateOrdemServicoCompletoDto';
export { UpdateOrdemServicoCompletoDto } from './UpdateOrdemServicoCompletoDto';

// DTOs filhos SemId
export { OrdemServicoTalhaoSemIdDto } from './OrdemServicoTalhaoSemIdDto';
export { OrdemServicoInsumoSemIdDto } from './OrdemServicoInsumoSemIdDto';
export { OrdemServicoMaquinaSemIdDto } from './OrdemServicoMaquinaSemIdDto';
export { OrdemServicoResponsavelSemIdDto } from './OrdemServicoResponsavelSemIdDto';

// DTOs de workflow
export { AtribuirOrdemServicoDto } from './AtribuirOrdemServicoDto';
export { IniciarOrdemServicoDto } from './IniciarOrdemServicoDto';
export { ConcluirOrdemServicoDto } from './ConcluirOrdemServicoDto';
export { ValidarOrdemServicoDto } from './ValidarOrdemServicoDto';
export { CancelarOrdemServicoDto } from './CancelarOrdemServicoDto';
