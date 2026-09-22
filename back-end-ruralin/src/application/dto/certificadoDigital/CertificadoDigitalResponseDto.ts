/**
 * CertificadoDigitalResponseDto - DTO para resposta de certificado digital
 *
 * IMPORTANTE: O campo senha NÃO é incluído na resposta por segurança.
 */
export class CertificadoDigitalResponseDto {
  id!: number;
  tenantId!: number;
  nome!: string;
  razao_social!: string;
  cnpj_cpf!: string;
  arquivo_path!: string;
  data_validade!: string;
  status!: string;
  ambiente!: string;
  uf!: string;
  padrao!: boolean;
  ativo!: boolean;
  usercreation!: number;
  datecreation!: Date;
}
