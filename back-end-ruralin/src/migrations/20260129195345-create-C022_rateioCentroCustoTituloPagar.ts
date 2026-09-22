import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C022_rateioCentroCustoTituloPagar
 * 
 * Esta migration cria a tabela C022_rateioCentroCustoTituloPagar para gerenciamento de rateios
 * do valor do título a pagar por centros de custo.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C022_rateioCentroCustoTituloPagar';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C022_rateioCentroCustoTituloPagar', {
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
      idTituloPagar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título a pagar ao qual o rateio pertence',
        references: {
          model: 'C019_tituloPagar',
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
    await queryInterface.addIndex('C022_rateioCentroCustoTituloPagar', ['tenantId'], {
      name: 'idx_rateioCentroCustoTituloPagar_tenantId',
    });

    await queryInterface.addIndex('C022_rateioCentroCustoTituloPagar', ['idTituloPagar'], {
      name: 'idx_rateioCentroCustoTituloPagar_idTituloPagar',
    });

    await queryInterface.addIndex('C022_rateioCentroCustoTituloPagar', ['idCentroCusto'], {
      name: 'idx_rateioCentroCustoTituloPagar_idCentroCusto',
    });

    await queryInterface.addIndex('C022_rateioCentroCustoTituloPagar', ['usercreation'], {
      name: 'idx_rateioCentroCustoTituloPagar_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C022_rateioCentroCustoTituloPagar');
}
