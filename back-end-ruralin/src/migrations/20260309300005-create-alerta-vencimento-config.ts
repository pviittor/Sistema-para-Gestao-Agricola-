import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 6 — Criar tabela alerta_vencimento_config
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('alerta_vencimento_config', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipoTitulo: {
        type: DataTypes.ENUM('PAGAR', 'RECEBER', 'AMBOS'),
        allowNull: false,
        comment: 'Tipo de título a monitorar',
      },
      antecedenciaAlerta1Dias: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 7,
        comment: 'Primeiro alerta: N dias antes (0 = desabilitado)',
      },
      antecedenciaAlerta2Dias: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        comment: 'Segundo alerta: N dias antes (0 = desabilitado)',
      },
      antecedenciaAlerta3Dias: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Terceiro alerta: N dias antes (0 = desabilitado)',
      },
      notificarNoVencimento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Gerar alerta no dia do vencimento',
      },
      notificarVencidos: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Gerar alertas para parcelas vencidas',
      },
      frequenciaRenotificacaoVencidosDias: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        comment: 'Intervalo de renotificação para vencidos',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Liga/desliga alertas',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex('alerta_vencimento_config', ['tenantId'], { name: 'idx_alertaConfig_tenantId' });
    await queryInterface.addIndex('alerta_vencimento_config', ['usuarioId', 'tenantId', 'tipoTitulo'], { name: 'idx_alertaConfig_unique', unique: true });
    await queryInterface.addIndex('alerta_vencimento_config', ['ativo'], { name: 'idx_alertaConfig_ativo' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('alerta_vencimento_config');
}
