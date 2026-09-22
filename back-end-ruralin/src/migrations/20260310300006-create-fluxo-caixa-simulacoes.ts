import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = await sequelize.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C061_fluxoCaixaSimulacao';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!tableExists || tableExists.length === 0) {
    await queryInterface.createTable('C061_fluxoCaixaSimulacao', {
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
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome da simulação de fluxo de caixa',
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada da simulação',
      },
      dataInicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de início da simulação',
      },
      dataFim: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de fim da simulação',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'rascunho',
        comment: 'Status da simulação: rascunho, ativa, arquivada',
      },
      resultadoSnapshot: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Snapshot do resultado da simulação em JSON',
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

    await queryInterface.addIndex('C061_fluxoCaixaSimulacao', ['tenantId', 'usuarioId'], {
      name: 'idx_fluxoCaixaSimulacao_tenant_usuario',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C061_fluxoCaixaSimulacao');
}
