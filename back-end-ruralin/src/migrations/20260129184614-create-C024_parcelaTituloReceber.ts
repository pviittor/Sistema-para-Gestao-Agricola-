import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C024_parcelaTituloReceber
 * 
 * Esta migration cria a tabela C024_parcelaTituloReceber para gerenciamento de parcelas de títulos a receber.
 * Representa uma parcela individual de um título a receber.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C024_parcelaTituloReceber';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C024_parcelaTituloReceber', {
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
      idTituloReceber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a receber ao qual a parcela pertence',
        references: {
          model: 'C023_tituloReceber',
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
    await queryInterface.addIndex('C024_parcelaTituloReceber', ['tenantId'], {
      name: 'idx_parcelaTituloReceber_tenantId',
    });

    await queryInterface.addIndex('C024_parcelaTituloReceber', ['idTituloReceber'], {
      name: 'idx_parcelaTituloReceber_idTituloReceber',
    });

    await queryInterface.addIndex('C024_parcelaTituloReceber', ['dataVencimento'], {
      name: 'idx_parcelaTituloReceber_dataVencimento',
    });

    await queryInterface.addIndex('C024_parcelaTituloReceber', ['status'], {
      name: 'idx_parcelaTituloReceber_status',
    });

    await queryInterface.addIndex('C024_parcelaTituloReceber', ['usercreation'], {
      name: 'idx_parcelaTituloReceber_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C024_parcelaTituloReceber');
}
