import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C046_itemNotaFiscal
 *
 * Esta migration cria a tabela C046_itemNotaFiscal para registro de itens de notas fiscais.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela ja existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C046_itemNotaFiscal';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C046_itemNotaFiscal', {
      id_item_nf: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID unico do item da nota fiscal (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o item pertence',
      },
      notaFiscalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da nota fiscal',
        references: {
          model: 'C045_notaFiscal',
          key: 'id_nf',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      produtoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do produto',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      numero_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Numero sequencial do item dentro da nota',
      },
      codigo_produto: {
        type: DataTypes.STRING(60),
        allowNull: false,
        comment: 'Codigo do produto no momento da emissao (desnormalizado)',
      },
      descricao: {
        type: DataTypes.STRING(120),
        allowNull: false,
        comment: 'Descricao do produto no momento da emissao',
      },
      ncm: {
        type: DataTypes.STRING(8),
        allowNull: false,
        comment: 'Nomenclatura Comum do Mercosul (8 digitos)',
      },
      cest: {
        type: DataTypes.STRING(7),
        allowNull: true,
        comment: 'Codigo Especificador da Substituicao Tributaria (7 digitos)',
      },
      cfop: {
        type: DataTypes.STRING(4),
        allowNull: false,
        comment: 'Codigo Fiscal de Operacoes e Prestacoes (4 digitos)',
      },
      unidade: {
        type: DataTypes.STRING(6),
        allowNull: false,
        comment: 'Unidade de medida (UN, KG, CX, LT, etc)',
      },
      quantidade: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        comment: 'Quantidade do item',
      },
      vl_unitario: {
        type: DataTypes.DECIMAL(15, 10),
        allowNull: false,
        comment: 'Valor unitario do item',
      },
      vl_desconto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do desconto',
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
      vl_outros: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Outros valores',
      },
      vl_bruto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor bruto (quantidade x vl_unitario)',
      },
      vl_total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor total (vl_bruto - vl_desconto + vl_frete + vl_seguro + vl_outros)',
      },
      cst_icms: {
        type: DataTypes.STRING(3),
        allowNull: false,
        comment: 'Codigo CST/CSOSN do ICMS (2-3 digitos)',
      },
      modalidade_bc_icms: {
        type: DataTypes.STRING(1),
        allowNull: true,
        comment: 'Modalidade base calculo ICMS: 0=MVA, 1=pauta, 2=preco tabelado, 3=valor operacao',
      },
      aliq_icms: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Aliquota ICMS (%)',
      },
      vl_bc_icms: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Base de calculo ICMS',
      },
      vl_icms: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do ICMS',
      },
      aliq_icms_st: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Aliquota ICMS ST (%)',
      },
      vl_bc_icms_st: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Base de calculo ICMS ST',
      },
      vl_icms_st: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do ICMS ST',
      },
      cst_ipi: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'Codigo CST do IPI (2 digitos)',
      },
      aliq_ipi: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Aliquota IPI (%)',
      },
      vl_ipi: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do IPI',
      },
      cst_pis: {
        type: DataTypes.STRING(2),
        allowNull: false,
        comment: 'Codigo CST do PIS (2 digitos)',
      },
      aliq_pis: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Aliquota PIS (%)',
      },
      vl_pis: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do PIS',
      },
      cst_cofins: {
        type: DataTypes.STRING(2),
        allowNull: false,
        comment: 'Codigo CST do COFINS (2 digitos)',
      },
      aliq_cofins: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Aliquota COFINS (%)',
      },
      vl_cofins: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor do COFINS',
      },
      numero_lote: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Numero do lote do produto',
      },
      data_fabricacao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de fabricacao do produto',
      },
      data_validade: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de validade do produto',
      },
      numero_serie_item: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Numero de serie do item',
      },
      informacoes_adicionais: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Informacoes adicionais do item',
      },
      movimentou_estoque: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se o item ja movimentou o estoque',
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
    await queryInterface.addIndex('C046_itemNotaFiscal', ['tenantId'], {
      name: 'idx_itemNF_tenantId',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['notaFiscalId'], {
      name: 'idx_itemNF_notaFiscalId',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['produtoId'], {
      name: 'idx_itemNF_produtoId',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['notaFiscalId', 'numero_item'], {
      unique: true,
      name: 'idx_itemNF_notaFiscal_numeroItem',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['ncm'], {
      name: 'idx_itemNF_ncm',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['cfop'], {
      name: 'idx_itemNF_cfop',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['numero_lote'], {
      name: 'idx_itemNF_numero_lote',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['numero_serie_item'], {
      name: 'idx_itemNF_numero_serie_item',
    });

    await queryInterface.addIndex('C046_itemNotaFiscal', ['movimentou_estoque'], {
      name: 'idx_itemNF_movimentou_estoque',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C046_itemNotaFiscal');
}
