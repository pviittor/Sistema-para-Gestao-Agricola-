/**
 * RegistroArmazenagemResponseDto - DTO para resposta de registro de armazenagem
 */
export class RegistroArmazenagemResponseDto {
  id!: number;
  tenantId!: number;
  tipo!: string;
  data!: string;
  hora?: string | null;
  idProduto!: number;
  idUnidadeMedida!: number;
  idOrigem!: number;
  idUnidadeDeposito!: number;
  idMotorista?: number | null;
  ticket?: string | null;
  placa?: string | null;
  peso_bruto?: number | null;
  peso_tara?: number | null;
  peso_liquido!: number;
  desconto_umidade!: number;
  desconto_impureza!: number;
  desconto_avariados!: number;
  desconto_esverdeados!: number;
  desconto_quebra_tecnica!: number;
  desconto_taxa_recepcao!: number;
  desconto_total!: number;
  observacoes?: string | null;
  usercreation!: number;
  datecreation!: Date;

  /**
   * Relacionamentos opcionais (quando incluídos na query)
   */
  produto?: {
    id_prod: number;
    descricao_prod: string;
  };

  unidadeMedida?: {
    id_unidade: number;
    descricao_unidade: string;
    abreviatura_unidade?: string | null;
  };

  origem?: {
    id_cfg: number;
    idTalhao: number;
    idCiclo: number;
    idCultura: number;
    talhao?: {
      id_talhao: number;
      descricao: string;
    };
  };

  unidadeDeposito?: {
    id: number;
    descricao: string;
  };

  motorista?: {
    id_pessoa: number;
    nomerazao_pessoa: string;
  };

  usuario?: {
    id: number;
    nome: string;
    email: string;
  };
}
