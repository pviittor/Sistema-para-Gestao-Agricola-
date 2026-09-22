import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = await sequelize.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C062_fluxoCaixaSimulacaoItem';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!tableExists || tableExists.length === 0) {
    await queryInterface.createTable('C062_fluxoCaixaSimulacaoItem', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      simulacaoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'C061_fluxoCaixaSimulacao',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tipoOverride: {
        type: DataTypes.STRING(30),
        allowNull: false,
        comment: 'Tipo de override: novo, alteracao_data, alteracao_valor, exclusao',
      },
      referenciaTipo: {
        type: DataTypes.STRING(30),
        allowNull: true,
        comment: 'Tipo da entidade referenciada: tituloPagar, tituloReceber, agreement, etc.',
      },
      referenciaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da entidade referenciada',
      },
      descricao: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Descrição do item da simulação',
      },
      tipoFluxo: {
        type: DataTypes.STRING(10),
        allowNull: false,
        comment: 'Tipo do fluxo: entrada ou saida',
      },
      dataOriginal: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data original do lançamento (antes do override)',
      },
      dataNova: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Nova data do lançamento (após override)',
      },
      valorOriginal: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        comment: 'Valor original do lançamento (antes do override)',
      },
      valorNovo: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        comment: 'Novo valor do lançamento (após override)',
      },
      contaBancariaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Conta bancária associada ao item simulado',
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

    await queryInterface.addIndex('C062_fluxoCaixaSimulacaoItem', ['simulacaoId'], {
      name: 'idx_fluxoCaixaSimulacaoItem_simulacaoId',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C062_fluxoCaixaSimulacaoItem');
}
