import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C020_parcelaTituloPagar
 * 
 * Esta migration cria a tabela C020_parcelaTituloPagar para gerenciamento de parcelas de títulos a pagar.
 * Representa uma parcela individual de um título a pagar.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C020_parcelaTituloPagar';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C020_parcelaTituloPagar', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da parcela (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a parcela pertence',
      },
      idTituloPagar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a pagar ao qual a parcela pertence',
        references: {
          model: 'C019_tituloPagar',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      numeroParcela: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Número sequencial da parcela (1, 2, 3...)',
      },
      dataVencimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de vencimento da parcela',
      },
      valorParcela: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor da parcela',
      },
      valorParcelaMoedaOriginal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor da parcela na moeda original',
      },
      valorParcelaMoedaPadrao: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor da parcela convertido para BRL',
      },
      dataBaixa: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de baixa da parcela',
      },
      valorBaixa: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor da baixa da parcela',
      },
      status: {
        type: DataTypes.ENUM('ABERTA', 'BAIXADA', 'CANCELADA'),
        allowNull: false,
        defaultValue: 'ABERTA',
        comment: 'Status da parcela (ABERTA, BAIXADA, CANCELADA)',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre a parcela',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou o registro',
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
        comment: 'Data de criação do registro',
      },
    });

    // Criar índices
    await queryInterface.addIndex('C020_parcelaTituloPagar', ['tenantId'], {
      name: 'idx_parcelaTituloPagar_tenantId',
    });

    await queryInterface.addIndex('C020_parcelaTituloPagar', ['idTituloPagar'], {
      name: 'idx_parcelaTituloPagar_idTituloPagar',
    });

    await queryInterface.addIndex('C020_parcelaTituloPagar', ['dataVencimento'], {
      name: 'idx_parcelaTituloPagar_dataVencimento',
    });

    await queryInterface.addIndex('C020_parcelaTituloPagar', ['status'], {
      name: 'idx_parcelaTituloPagar_status',
    });

    await queryInterface.addIndex('C020_parcelaTituloPagar', ['usercreation'], {
      name: 'idx_parcelaTituloPagar_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C020_parcelaTituloPagar');
}
