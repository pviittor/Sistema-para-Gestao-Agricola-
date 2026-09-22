import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 5 — Criar tabela lancamento_recorrente
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('lancamento_recorrente', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do lançamento recorrente',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant',
      },
      recorrenciaFinanceiraId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'FK para a recorrência template',
      },
      tituloPagarId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK para TituloPagar gerado (quando tipo=PAGAR)',
      },
      tituloReceberId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'FK para TituloReceber gerado (quando tipo=RECEBER)',
      },
      dataReferencia: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Mês/período de competência',
      },
      dataVencimentoGerado: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de vencimento efetiva gerada',
      },
      valorGerado: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor do título gerado',
      },
      status: {
        type: DataTypes.ENUM('GERADO', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'GERADO',
        comment: 'Status do lançamento',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observação sobre a geração',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação',
      },
    });

    await queryInterface.addIndex('lancamento_recorrente', ['tenantId'], { name: 'idx_lancRecorrente_tenantId' });
    await queryInterface.addIndex('lancamento_recorrente', ['recorrenciaFinanceiraId'], { name: 'idx_lancRecorrente_recorrenciaId' });
    await queryInterface.addIndex('lancamento_recorrente', ['recorrenciaFinanceiraId', 'dataReferencia', 'status'], { name: 'idx_lancRecorrente_idempotencia', unique: true });
    await queryInterface.addIndex('lancamento_recorrente', ['tituloPagarId'], { name: 'idx_lancRecorrente_tituloPagarId' });
    await queryInterface.addIndex('lancamento_recorrente', ['tituloReceberId'], { name: 'idx_lancRecorrente_tituloReceberId' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('lancamento_recorrente');
}
