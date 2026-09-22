import { IApplicationService } from '../IApplicationService';
import { CreatePrincipioAtivoDto } from '../../dto/principioAtivo/CreatePrincipioAtivoDto';
import { UpdatePrincipioAtivoDto } from '../../dto/principioAtivo/UpdatePrincipioAtivoDto';
import { PrincipioAtivoResponseDto } from '../../dto/principioAtivo/PrincipioAtivoResponseDto';

/**
 * Interface para Application Service de PrincipioAtivo
 * 
 * Define os métodos disponíveis para operações de negócio com princípio ativo.
 */
export interface IPrincipioAtivoApplicationService extends IApplicationService<PrincipioAtivoResponseDto, CreatePrincipioAtivoDto, UpdatePrincipioAtivoDto> {
  // TODO: Adicionar métodos customizados se necessário
}
