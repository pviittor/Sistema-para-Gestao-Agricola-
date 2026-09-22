import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = await sequelize.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C065_recibo';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!tableExists || tableExists.length === 0) {
    await queryInterface.createTable('C065_recibo', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'C012_tenant',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      serie: {
        type: DataTypes.STRING(5),
        allowNull: false,
        comment: 'Série do recibo',
      },
      numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Número sequencial do recibo na série',
      },
      numeroFormatado: {
        type: DataTypes.STRING(15),
        allowNull: false,
        comment: 'Número formatado para exibição (ex: REC-000001)',
      },
      nomeEmitente: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome do emitente do recibo',
      },
      documentoEmitente: {
        type: DataTypes.STRING(18),
        allowNull: true,
        comment: 'CPF ou CNPJ do emitente',
      },
      nomeBeneficiario: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome do beneficiário/pagador',
      },
      documentoBeneficiario: {
        type: DataTypes.STRING(18),
        allowNull: true,
        comment: 'CPF ou CNPJ do beneficiário',
      },
      valor: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do recibo',
      },
      valorExtenso: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Valor por extenso',
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Descrição/referente do recibo',
      },
      formaPagamento: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: 'Forma de pagamento (DINHEIRO, PIX, TRANSFERENCIA, etc.)',
      },
      dataEmissao: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de emissão do recibo',
      },
      local: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Local de emissão do recibo',
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais',
      },
      status: {
        type: DataTypes.STRING(15),
        allowNull: false,
        defaultValue: 'EMITIDO',
        comment: 'Status do recibo (EMITIDO, CANCELADO)',
      },
      motivoCancelamento: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Motivo do cancelamento, quando aplicável',
      },
      usuarioCancelamentoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuário que cancelou o recibo',
      },
      dataCancelamento: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data/hora do cancelamento',
      },
      tipoVinculo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'AVULSO',
        comment: 'Tipo de vínculo (AVULSO, TITULO_PAGAR, TITULO_RECEBER)',
      },
      tituloPagarId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'C019_tituloPagar',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'FK para título a pagar vinculado',
      },
      tituloReceberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'C023_tituloReceber',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'FK para título a receber vinculado',
      },
      parcelaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da parcela vinculada (sem FK pois pode ser parcela de pagar ou receber)',
      },
      quantidadeImpressoes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantidade de vezes que o recibo foi impresso',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuário que criou o recibo',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Índice único composto: tenantId + serie + numero
    await queryInterface.addIndex('C065_recibo', ['tenantId', 'serie', 'numero'], {
      unique: true,
      name: 'idx_recibo_tenant_serie_numero',
    });

    // Índice: tenantId + status
    await queryInterface.addIndex('C065_recibo', ['tenantId', 'status'], {
      name: 'idx_recibo_tenant_status',
    });

    // Índice: tenantId + dataEmissao
    await queryInterface.addIndex('C065_recibo', ['tenantId', 'dataEmissao'], {
      name: 'idx_recibo_tenant_data',
    });

    // Índice: tenantId + nomeBeneficiario
    await queryInterface.addIndex('C065_recibo', ['tenantId', 'nomeBeneficiario'], {
      name: 'idx_recibo_tenant_beneficiario',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C065_recibo');
}
