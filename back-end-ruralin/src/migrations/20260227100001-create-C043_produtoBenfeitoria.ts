import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C043_produtoBenfeitoria
 *
 * Esta migration cria a tabela C043_produtoBenfeitoria para registro de produtos utilizados em benfeitorias.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C043_produtoBenfeitoria';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C043_produtoBenfeitoria', {
      id_prodbenf: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do produto benfeitoria (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      idBenfeitoria: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da benfeitoria relacionada',
        references: {
          model: 'C042_benfeitoria',
          key: 'id_benf',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idProduto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do produto utilizado',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de utilização do produto',
      },
      quantidade: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Quantidade utilizada',
      },
      unitario: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor unitário do produto',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais',
      },
      idSafra: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da safra',
        references: {
          model: 'C017_safra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
    await queryInterface.addIndex('C043_produtoBenfeitoria', ['tenantId'], {
      name: 'idx_prodbenf_tenantId',
    });

    await queryInterface.addIndex('C043_produtoBenfeitoria', ['idBenfeitoria'], {
      name: 'idx_prodbenf_idBenfeitoria',
    });

    await queryInterface.addIndex('C043_produtoBenfeitoria', ['idProduto'], {
      name: 'idx_prodbenf_idProduto',
    });

    await queryInterface.addIndex('C043_produtoBenfeitoria', ['data'], {
      name: 'idx_prodbenf_data',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C043_produtoBenfeitoria');
}
