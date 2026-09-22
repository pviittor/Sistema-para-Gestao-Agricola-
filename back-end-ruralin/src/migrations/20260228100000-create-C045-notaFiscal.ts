import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C045_notaFiscal
 *
 * Esta migration cria a tabela C045_notaFiscal para cabecalho de notas fiscais
 * de entrada e saida de mercadorias/servicos.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C045_notaFiscal';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C045_notaFiscal', {
      id_nf: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico da nota fiscal (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
        comment: 'Modalidade de frete',
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
    });

    // Criar indices
    await queryInterface.addIndex('C045_notaFiscal', ['tenantId'], {
      name: 'idx_nf_tenantId',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['emitenteId'], {
      name: 'idx_nf_emitenteId',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['destinatarioId'], {
      name: 'idx_nf_destinatarioId',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['empresaId'], {
      name: 'idx_nf_empresaId',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['transportadoraId'], {
      name: 'idx_nf_transportadoraId',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['notaFiscalRefId'], {
      name: 'idx_nf_notaFiscalRefId',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['status'], {
      name: 'idx_nf_status',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['tipo'], {
      name: 'idx_nf_tipo',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['data_emissao'], {
      name: 'idx_nf_data_emissao',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['data_entrada_saida'], {
      name: 'idx_nf_data_entrada_saida',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['ativo'], {
      name: 'idx_nf_ativo',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['usercreation'], {
      name: 'idx_nf_usercreation',
    });

    await queryInterface.addIndex('C045_notaFiscal', ['numero', 'serie', 'modelo', 'emitenteId', 'tenantId'], {
      unique: true,
      name: 'idx_nf_numero_serie_modelo_emitente_tenant',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C045_notaFiscal');
}
