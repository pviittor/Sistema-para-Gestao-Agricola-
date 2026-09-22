import { DataTypes, QueryInterface, QueryTypes } from 'sequelize';
import sequelize from '../config/database';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const tableExists = await sequelize.query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C064_configuracaoRecibo';
  `, { type: QueryTypes.SELECT }) as any[];

  if (!tableExists || tableExists.length === 0) {
    await queryInterface.createTable('C064_configuracaoRecibo', {
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
      nomePropriedade: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome da propriedade/empresa para exibição no recibo',
      },
      cnpjCpf: {
        type: DataTypes.STRING(18),
        allowNull: true,
        comment: 'CNPJ ou CPF do emitente',
      },
      inscricaoEstadual: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Inscrição estadual do emitente',
      },
      endereco: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Endereço completo do emitente',
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Telefone de contato',
      },
      logoBase64: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Logo em base64 para impressão no recibo',
      },
      observacaoPadrao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observação padrão incluída em novos recibos',
      },
      localPadrao: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Local padrão para emissão de recibos',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se a configuração está ativa',
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

    // Índice único no tenantId (1 configuração por tenant)
    await queryInterface.addIndex('C064_configuracaoRecibo', ['tenantId'], {
      unique: true,
      name: 'idx_configuracao_recibo_tenant',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C064_configuracaoRecibo');
}
