import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
    await queryInterface.createTable('C055_numeracaoNfe', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'C012_tenant', key: 'id' },
        onDelete: 'RESTRICT',
      },
      serie: {
        type: DataTypes.STRING(5),
        allowNull: false,
        comment: 'Série da NF-e (ex: 1, 2, 100)',
      },
      modelo: {
        type: DataTypes.STRING(2),
        allowNull: false,
        comment: 'Modelo: 55=NF-e, 65=NFC-e',
      },
      ultimo_numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Último número utilizado na série/modelo',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Índice UNIQUE composto
    await queryInterface.addIndex('C055_numeracaoNfe', ['tenantId', 'serie', 'modelo'], {
      unique: true,
      name: 'idx_numeracao_nfe_tenant_serie_modelo',
    });

    // Índice em tenantId
    await queryInterface.addIndex('C055_numeracaoNfe', ['tenantId'], {
      name: 'idx_numeracao_nfe_tenant',
    });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('C055_numeracaoNfe');
}
