import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Pessoa from './Pessoa';
import Usuario from './Usuario';
import Cfop from './Cfop';

/**
 * Interface para atributos da entidade NotaFiscal
 */
interface NotaFiscalAttributes {
  id_nf: number;
  tenantId: number;
  tipo: string;
  numero: string;
  serie: string;
  chave_acesso?: string | null;
  modelo: string;
  natureza_operacao: string;
  cfop: string;
  finalidade: string;
  data_emissao: Date;
  data_entrada_saida: Date;
  hora_entrada_saida?: string | null;
  status: string;
  emitenteId: number;
  destinatarioId: number;
  empresaId: number;
  transportadoraId?: number | null;
  modalidade_frete?: string | null;
  vl_produtos: number;
  vl_frete: number;
  vl_seguro: number;
  vl_desconto: number;
  vl_outros: number;
  vl_ipi: number;
  vl_icms: number;
  vl_pis: number;
  vl_cofins: number;
  vl_total: number;
  volumes_qtd?: number | null;
  volumes_especie?: string | null;
  peso_bruto?: number | null;
  peso_liquido?: number | null;
  informacoes_adicionais?: string | null;
  informacoes_complementares?: string | null;
  xml_autorizacao?: string | null;
  protocolo_autorizacao?: string | null;
  data_autorizacao?: Date | null;
  motivo_cancelamento?: string | null;
  data_cancelamento?: Date | null;
  estoque_movimentado: boolean;
  financeiro_gerado: boolean;
  ativo: boolean;
  notaFiscalRefId?: number | null;
  certificadoDigitalId?: number | null;
  cfopId?: number | null;
  ambiente_sefaz?: string | null;
  contingencia_tipo?: string | null;
  contingencia_justificativa?: string | null;
  contingencia_data_inicio?: Date | null;
  numero_sequencial?: number | null;
  condicao_pagamento?: string | null;
  parcelas_qtd?: number | null;
  usercreation: number;
  datecreation: Date;
}

/**
 * Interface para atributos de criacao (id_nf e opcional pois e auto-increment)
 */
interface NotaFiscalCreationAttributes extends Optional<NotaFiscalAttributes,
  'id_nf' | 'datecreation' | 'chave_acesso' | 'hora_entrada_saida' | 'status' |
  'transportadoraId' | 'modalidade_frete' | 'vl_produtos' | 'vl_frete' | 'vl_seguro' |
  'vl_desconto' | 'vl_outros' | 'vl_ipi' | 'vl_icms' | 'vl_pis' | 'vl_cofins' | 'vl_total' |
  'volumes_qtd' | 'volumes_especie' | 'peso_bruto' | 'peso_liquido' |
  'informacoes_adicionais' | 'informacoes_complementares' | 'xml_autorizacao' |
  'protocolo_autorizacao' | 'data_autorizacao' | 'motivo_cancelamento' | 'data_cancelamento' |
  'estoque_movimentado' | 'financeiro_gerado' | 'ativo' | 'notaFiscalRefId' |
  'certificadoDigitalId' | 'cfopId' | 'ambiente_sefaz' | 'contingencia_tipo' |
  'contingencia_justificativa' | 'contingencia_data_inicio' | 'numero_sequencial' |
  'condicao_pagamento' | 'parcelas_qtd'
> {}

/**
 * Modelo Sequelize para a entidade NotaFiscal
 *
 * Cabecalho de notas fiscais de entrada e saida de mercadorias/servicos
 */
class NotaFiscal
  extends Model<NotaFiscalAttributes, NotaFiscalCreationAttributes>
  implements NotaFiscalAttributes
{
  public id_nf!: number;
  public tenantId!: number;
  public tipo!: string;
  public numero!: string;
  public serie!: string;
  public chave_acesso!: string | null;
  public modelo!: string;
  public natureza_operacao!: string;
  public cfop!: string;
  public finalidade!: string;
  public data_emissao!: Date;
  public data_entrada_saida!: Date;
  public hora_entrada_saida!: string | null;
  public status!: string;
  public emitenteId!: number;
  public destinatarioId!: number;
  public empresaId!: number;
  public transportadoraId!: number | null;
  public modalidade_frete!: string | null;
  public vl_produtos!: number;
  public vl_frete!: number;
  public vl_seguro!: number;
  public vl_desconto!: number;
  public vl_outros!: number;
  public vl_ipi!: number;
  public vl_icms!: number;
  public vl_pis!: number;
  public vl_cofins!: number;
  public vl_total!: number;
  public volumes_qtd!: number | null;
  public volumes_especie!: string | null;
  public peso_bruto!: number | null;
  public peso_liquido!: number | null;
  public informacoes_adicionais!: string | null;
  public informacoes_complementares!: string | null;
  public xml_autorizacao!: string | null;
  public protocolo_autorizacao!: string | null;
  public data_autorizacao!: Date | null;
  public motivo_cancelamento!: string | null;
  public data_cancelamento!: Date | null;
  public estoque_movimentado!: boolean;
  public financeiro_gerado!: boolean;
  public ativo!: boolean;
  public notaFiscalRefId!: number | null;
  public certificadoDigitalId!: number | null;
  public cfopId!: number | null;
  public ambiente_sefaz!: string | null;
  public contingencia_tipo!: string | null;
  public contingencia_justificativa!: string | null;
  public contingencia_data_inicio!: Date | null;
  public numero_sequencial!: number | null;
  public condicao_pagamento!: string | null;
  public parcelas_qtd!: number | null;
  public usercreation!: number;
  public datecreation!: Date;

  // Relacionamentos
  public emitente?: Pessoa;
  public destinatario?: Pessoa;
  public empresa?: Pessoa;
  public transportadora?: Pessoa;
  public notaFiscalRef?: NotaFiscal;
  public usuarioCriador?: Usuario;
}

NotaFiscal.init(
  {
    id_nf: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID unico da nota fiscal',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'tenantId',
      comment: 'ID do tenant ao qual a nota fiscal pertence',
    },
    tipo: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Tipo da nota fiscal (entrada, saida)',
    },
    numero: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Numero da nota fiscal',
    },
    serie: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Serie da nota fiscal',
    },
    chave_acesso: {
      type: DataTypes.STRING(44),
      allowNull: true,
      unique: true,
      comment: 'Chave de acesso da NF-e (44 digitos)',
    },
    modelo: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Modelo do documento fiscal (55=NF-e, 65=NFC-e, 01=NF papel, 04=NFS-e)',
    },
    natureza_operacao: {
      type: DataTypes.STRING(60),
      allowNull: false,
      comment: 'Natureza da operacao',
    },
    cfop: {
      type: DataTypes.STRING(4),
      allowNull: false,
      comment: 'Codigo Fiscal de Operacoes e Prestacoes',
    },
    finalidade: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'normal',
      comment: 'Finalidade da nota (normal, complementar, ajuste, devolucao)',
    },
    data_emissao: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data de emissao da nota fiscal',
    },
    data_entrada_saida: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Data de entrada ou saida da mercadoria',
    },
    hora_entrada_saida: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora de entrada ou saida da mercadoria',
    },
    status: {
      type: DataTypes.ENUM('rascunho', 'pendente', 'autorizada', 'cancelada', 'denegada', 'inutilizada'),
      allowNull: false,
      defaultValue: 'rascunho',
      comment: 'Status da nota fiscal',
    },
    emitenteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa emitente',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    destinatarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da pessoa destinataria',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da empresa (pessoa com fornecedor_pessoa=true)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    transportadoraId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da pessoa transportadora',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    modalidade_frete: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: 'sem_frete',
      comment: 'Modalidade de frete (emitente, destinatario, terceiros, proprio_remetente, proprio_destinatario, sem_frete)',
    },
    vl_produtos: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total dos produtos (soma dos itens)',
    },
    vl_frete: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do frete',
    },
    vl_seguro: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do seguro',
    },
    vl_desconto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor do desconto',
    },
    vl_outros: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Outras despesas acessorias',
    },
    vl_ipi: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total do IPI (consolidado dos itens)',
    },
    vl_icms: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total do ICMS (consolidado dos itens)',
    },
    vl_pis: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total do PIS (consolidado dos itens)',
    },
    vl_cofins: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total do COFINS (consolidado dos itens)',
    },
    vl_total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Valor total da nota fiscal (calculado automaticamente)',
    },
    volumes_qtd: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantidade de volumes',
    },
    volumes_especie: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: 'Especie dos volumes (ex: CAIXA, FARDO, PALLET)',
    },
    peso_bruto: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: true,
      comment: 'Peso bruto em kg',
    },
    peso_liquido: {
      type: DataTypes.DECIMAL(15, 3),
      allowNull: true,
      comment: 'Peso liquido em kg',
    },
    informacoes_adicionais: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Informacoes adicionais de interesse do fisco',
    },
    informacoes_complementares: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Informacoes complementares de interesse do contribuinte',
    },
    xml_autorizacao: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'XML retornado pela SEFAZ apos autorizacao',
    },
    protocolo_autorizacao: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Numero do protocolo de autorizacao SEFAZ',
    },
    data_autorizacao: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora de autorizacao pela SEFAZ',
    },
    motivo_cancelamento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo do cancelamento da nota',
    },
    data_cancelamento: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora do cancelamento',
    },
    estoque_movimentado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o estoque ja foi movimentado por esta nota',
    },
    financeiro_gerado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se as parcelas financeiras foram geradas',
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Soft delete - indica se o registro esta ativo',
    },
    notaFiscalRefId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da nota fiscal de referencia (para devolucoes)',
      references: {
        model: 'C045_notaFiscal',
        key: 'id_nf',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    certificadoDigitalId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para certificado digital A1 usado na emissão',
      references: {
        model: 'C052_certificadoDigital',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    cfopId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'FK para entidade CFOP (C051_cfop)',
      references: {
        model: 'C051_cfop',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    ambiente_sefaz: {
      type: DataTypes.STRING(15),
      allowNull: true,
      comment: 'Ambiente SEFAZ: homologacao, producao',
    },
    contingencia_tipo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Tipo de contingência: SCAN, SVC-AN, SVC-RS',
    },
    contingencia_justificativa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justificativa para entrada em contingência',
    },
    contingencia_data_inicio: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data/hora de início da contingência',
    },
    numero_sequencial: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Número sequencial de controle por série/tenant',
    },
    condicao_pagamento: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Condição de pagamento (à vista, 30, 30/60, 30/60/90, etc.)',
    },
    parcelas_qtd: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Quantidade de parcelas para geração financeira',
    },
    usercreation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do usuario que criou o registro',
      references: {
        model: 'usuarios',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    datecreation: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de criacao do registro',
    },
  },
  {
    sequelize,
    tableName: 'C045_notaFiscal',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['tenantId'],
      },
      {
        fields: ['emitenteId'],
      },
      {
        fields: ['destinatarioId'],
      },
      {
        fields: ['empresaId'],
      },
      {
        fields: ['transportadoraId'],
      },
      {
        fields: ['notaFiscalRefId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['data_emissao'],
      },
      {
        fields: ['data_entrada_saida'],
      },
      {
        unique: true,
        fields: ['chave_acesso'],
        name: 'idx_nf_chave_acesso',
        where: {
          chave_acesso: { [require('sequelize').Op.ne]: null },
        },
      },
      {
        unique: true,
        fields: ['numero', 'serie', 'modelo', 'emitenteId', 'tenantId'],
        name: 'idx_nf_numero_serie_modelo_emitente_tenant',
      },
      {
        fields: ['ativo'],
      },
      {
        fields: ['usercreation'],
      },
      {
        fields: ['certificadoDigitalId'],
      },
      {
        fields: ['cfopId'],
      },
    ],
  }
);

// Setup associations
NotaFiscal.belongsTo(Pessoa, { foreignKey: 'emitenteId', as: 'emitente' });
NotaFiscal.belongsTo(Pessoa, { foreignKey: 'destinatarioId', as: 'destinatario' });
NotaFiscal.belongsTo(Pessoa, { foreignKey: 'empresaId', as: 'empresa' });
NotaFiscal.belongsTo(Pessoa, { foreignKey: 'transportadoraId', as: 'transportadora' });
NotaFiscal.belongsTo(NotaFiscal, { foreignKey: 'notaFiscalRefId', as: 'notaFiscalRef' });
NotaFiscal.belongsTo(Usuario, { foreignKey: 'usercreation', as: 'usuarioCriador' });
NotaFiscal.belongsTo(Cfop, { foreignKey: 'cfopId', as: 'cfopEntidade' });
// Relacionamentos hasMany removidos para evitar dependencias circulares
// Os relacionamentos serao estabelecidos atraves dos belongsTo nos models filhos

export default NotaFiscal;
