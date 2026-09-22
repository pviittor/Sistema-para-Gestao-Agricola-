import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C036_atividadeAgricola
 *
 * Esta migration cria a tabela C036_atividadeAgricola para cadastro de atividades agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C036_atividadeAgricola';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C036_atividadeAgricola', {
      id_atv: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da atividade agrícola (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a atividade pertence',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição da atividade agrícola',
      },
      tipo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tipo da atividade (0=Produção, 1=Manutenção Máquinas, 2=Administrativas)',
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
    await queryInterface.addIndex('C036_atividadeAgricola', ['tenantId'], {
      name: 'idx_atividadeAgricola_tenantId',
    });

    await queryInterface.addIndex('C036_atividadeAgricola', ['tipo'], {
      name: 'idx_atividadeAgricola_tipo',
    });

    await queryInterface.addIndex('C036_atividadeAgricola', ['usercreation'], {
      name: 'idx_atividadeAgricola_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C036_atividadeAgricola');
}
