/**
 * KardexProdutoDto - DTO para relatório Kardex de produto
 */
export class KardexProdutoDto {
  id_mov!: number;
  data!: string;
  tipomov!: number;
  operacao!: number;
  quantidade!: number;
  valor!: number;
  produto?: {
    id_prod: number;
    descricao_prod: string;
  } | null;
  fazenda?: {
    id: number;
    descricao: string;
  } | null;
  produtor?: {
    id_pessoa: number;
    nomerazao_pessoa: string | null;
  } | null;
}
