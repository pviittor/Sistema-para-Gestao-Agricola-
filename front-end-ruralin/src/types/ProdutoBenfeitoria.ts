import type { Benfeitoria } from './Benfeitoria';
import type { Produto } from './Produto';
import type { Safra } from './Safra';
import type { Usuario } from './Usuario';

export interface ProdutoBenfeitoria {
  id_prodbenf?: number;
  tenantId?: number;
  idBenfeitoria: number;
  idProduto: number;
  data: string;
  quantidade: number;
  unitario: number;
  observacao?: string | null;
  idSafra?: number | null;
  usercreation?: number;
  datecreation?: string;

  // Relacionamentos
  benfeitoria?: Benfeitoria;
  produto?: Produto;
  safra?: Safra;
  usuarioCriador?: Usuario;
}
