import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C026_rateioCentroCustoTituloReceber
 * 
 * Esta migration cria a tabela C026_rateioCentroCustoTituloReceber para gerenciamento de rateios
 * do valor do título a receber por centros de custo.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C026_rateioCentroCustoTituloReceber';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C026_rateioCentroCustoTituloReceber', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do rateio (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o rateio pertence',
      },
      idTituloReceber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a receber ao qual o rateio pertence',
        references: {
          model: 'C023_tituloReceber',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      idCentroCusto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do centro de custo',
        references: {
          model: 'C016_centroCusto',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      valorRateio: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do rateio',
      },
      percentualRateio: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Percentual do rateio em relação ao valor do título (calculado automaticamente)',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre o rateio',
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
    await queryInterface.addIndex('C026_rateioCentroCustoTituloReceber', ['tenantId'], {
      name: 'idx_rateioCentroCustoTituloReceber_tenantId',
    });

    await queryInterface.addIndex('C026_rateioCentroCustoTituloReceber', ['idTituloReceber'], {
      name: 'idx_rateioCentroCustoTituloReceber_idTituloReceber',
    });

    await queryInterface.addIndex('C026_rateioCentroCustoTituloReceber', ['idCentroCusto'], {
      name: 'idx_rateioCentroCustoTituloReceber_idCentroCusto',
    });

    await queryInterface.addIndex('C026_rateioCentroCustoTituloReceber', ['usercreation'], {
      name: 'idx_rateioCentroCustoTituloReceber_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C026_rateioCentroCustoTituloReceber');
}
