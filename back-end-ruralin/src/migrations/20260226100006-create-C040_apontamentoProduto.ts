import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C040_apontamentoProduto
 *
 * Esta migration cria a tabela C040_apontamentoProduto para registro de produtos em apontamentos agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C040_apontamentoProduto';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C040_apontamentoProduto', {
      id_aptprod: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do apontamento de produto (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      idApontamento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do apontamento relacionado',
        references: {
          model: 'C038_apontamento',
          key: 'id_apt',
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
      quantidade: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Quantidade do produto',
      },
      valor: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Valor do produto',
      },
      temperatura: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Temperatura registrada',
      },
      umidade: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Umidade registrada',
      },
      periodo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Período do apontamento',
      },
      data: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do apontamento de produto',
      },
      numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Número sequencial',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais',
      },
      area: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Área aplicada',
      },
      dosagem: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: false,
        comment: 'Dosagem aplicada',
      },
      produtoConvertidoMoeda: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se o produto foi convertido para moeda',
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
    await queryInterface.addIndex('C040_apontamentoProduto', ['tenantId'], {
      name: 'idx_aptprod_tenantId',
    });

    await queryInterface.addIndex('C040_apontamentoProduto', ['idApontamento'], {
      name: 'idx_aptprod_idApontamento',
    });

    await queryInterface.addIndex('C040_apontamentoProduto', ['idProduto'], {
      name: 'idx_aptprod_idProduto',
    });

    await queryInterface.addIndex('C040_apontamentoProduto', ['data'], {
      name: 'idx_aptprod_data',
    });

    await queryInterface.addIndex('C040_apontamentoProduto', ['usercreation'], {
      name: 'idx_aptprod_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C040_apontamentoProduto');
}
