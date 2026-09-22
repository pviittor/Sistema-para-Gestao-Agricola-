import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = await sequelize.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C060_fluxoCaixaConfiguracao';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!tableExists || tableExists.length === 0) {
    await queryInterface.createTable('C060_fluxoCaixaConfiguracao', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'C012_tenant',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      saldoMinimoAlerta: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Saldo mínimo para alerta no fluxo de caixa',
      },
      diasProjecaoPadrao: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 90,
        comment: 'Quantidade de dias padrão para projeção do fluxo',
      },
      periodicidadePadrao: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'mensal',
        comment: 'Periodicidade padrão: diario, semanal, mensal',
      },
      incluirAgreements: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Incluir acordos no fluxo de caixa',
      },
      incluirTitulos: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Incluir títulos a pagar/receber no fluxo de caixa',
      },
      incluirRecorrentes: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Incluir recorrências financeiras no fluxo de caixa',
      },
      contasBancariasFiltro: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Lista de IDs de contas bancárias para filtrar no fluxo',
      },
      coresConfiguracao: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Configuração de cores para o gráfico do fluxo de caixa',
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
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C060_fluxoCaixaConfiguracao');
}
