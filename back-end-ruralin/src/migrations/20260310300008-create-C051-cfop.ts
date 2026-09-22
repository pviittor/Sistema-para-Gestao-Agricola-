import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para criar tabela C051_cfop
 *
 * Tabela de referência de Códigos Fiscais de Operações e Prestações (CFOP).
 * Tabela global — NÃO é multi-tenant.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('C051_cfop', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do CFOP',
      },
      codigo: {
        type: DataTypes.STRING(4),
        allowNull: false,
        unique: true,
        comment: 'Código CFOP (ex: 5102, 6108)',
      },
      descricao: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Descrição oficial do CFOP',
      },
      natureza: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Natureza da operação: entrada, saida',
      },
      tipo_operacao: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Tipo: venda, compra, transferencia, remessa, retorno, devolucao, bonificacao, consignacao, outras',
      },
      gera_financeiro: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se operações com este CFOP devem gerar títulos financeiros',
      },
      movimenta_estoque: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se operações com este CFOP movimentam estoque',
      },
      aplicacao_ipi: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'CFOP sujeito a IPI',
      },
      aplicacao_icms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'CFOP sujeito a ICMS',
      },
      aplicacao_pis_cofins: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'CFOP sujeito a PIS/COFINS',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'CFOP ativo para uso',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de atualização',
      },
    })

    await queryInterface.addIndex('C051_cfop', ['codigo'], {
      unique: true,
      name: 'idx_cfop_codigo',
    })

    await queryInterface.addIndex('C051_cfop', ['natureza'], {
      name: 'idx_cfop_natureza',
    })

    await queryInterface.addIndex('C051_cfop', ['tipo_operacao'], {
      name: 'idx_cfop_tipo_operacao',
    })

    await queryInterface.addIndex('C051_cfop', ['ativo'], {
      name: 'idx_cfop_ativo',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C051_cfop')
}
