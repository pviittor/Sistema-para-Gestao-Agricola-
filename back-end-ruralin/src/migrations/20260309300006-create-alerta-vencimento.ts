import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 7 — Criar tabela alerta_vencimento (entidade separada do Lembrete, conforme PO #5)
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('alerta_vencimento', {
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
      alertaVencimentoConfigId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipoParcela: {
        type: DataTypes.ENUM('PAGAR', 'RECEBER'),
        allowNull: false,
        comment: 'Tipo da parcela',
      },
      idParcela: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da parcela (C020 ou C024)',
      },
      idTitulo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do título pai (C019 ou C023)',
      },
      dataVencimentoParcela: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de vencimento da parcela',
      },
      dataAlerta: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data em que o alerta foi gerado',
      },
      tipoAlerta: {
        type: DataTypes.ENUM('ANTECIPADO', 'NO_VENCIMENTO', 'VENCIDO'),
        allowNull: false,
        comment: 'Tipo do alerta gerado',
      },
      diasAntecedencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Dias de antecedência (ou atraso se negativo)',
      },
      mensagem: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Mensagem do alerta',
      },
      valorSaldo: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Saldo devedor no momento do alerta',
      },
      lido: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se o alerta foi lido pelo usuário',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    await queryInterface.addIndex('alerta_vencimento', ['tenantId'], { name: 'idx_alertaVenc_tenantId' });
    await queryInterface.addIndex('alerta_vencimento', ['usuarioId'], { name: 'idx_alertaVenc_usuarioId' });
    await queryInterface.addIndex('alerta_vencimento', ['tipoParcela', 'idParcela', 'dataAlerta'], { name: 'idx_alertaVenc_dedup' });
    await queryInterface.addIndex('alerta_vencimento', ['lido'], { name: 'idx_alertaVenc_lido' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('alerta_vencimento');
}
