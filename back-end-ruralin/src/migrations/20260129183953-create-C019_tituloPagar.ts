import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C019_tituloPagar
 * 
 * Esta migration cria a tabela C019_tituloPagar para gerenciamento de títulos a pagar.
 * Representa um título/documento a ser pago pelo sistema.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C019_tituloPagar';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C019_tituloPagar', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do título a pagar (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o título pertence',
      },
      idFornecedor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da pessoa (fornecedor)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idPortador: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da pessoa (portador)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idProdutor: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da pessoa (produtor)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da fazenda',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idSafra: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da safra',
        references: {
          model: 'C017_safra',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      idMoeda: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da moeda',
        references: {
          model: 'C006_moeda',
          key: 'id_moeda',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dataLancamento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de lançamento do título',
      },
      numeroTitulo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Número do título (único por tenant)',
      },
      valorTitulo: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor total do título (soma de todas as parcelas)',
      },
      valorTituloMoedaOriginal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor do título na moeda original',
      },
      valorTituloMoedaPadrao: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Valor do título convertido para BRL',
      },
      quantidadeParcelas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Quantidade de parcelas do título (calculado automaticamente)',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações sobre o título',
      },
      impostoRenda: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se o título está sujeito a imposto de renda',
      },
      status: {
        type: DataTypes.ENUM('ABERTO', 'PARCIAL', 'BAIXADO', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'ABERTO',
        comment: 'Status do título (ABERTO, PARCIAL, BAIXADO, CANCELADO)',
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
    await queryInterface.addIndex('C019_tituloPagar', ['tenantId'], {
      name: 'idx_tituloPagar_tenantId',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['idFornecedor'], {
      name: 'idx_tituloPagar_idFornecedor',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['idPortador'], {
      name: 'idx_tituloPagar_idPortador',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['idProdutor'], {
      name: 'idx_tituloPagar_idProdutor',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['idFazenda'], {
      name: 'idx_tituloPagar_idFazenda',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['idSafra'], {
      name: 'idx_tituloPagar_idSafra',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['idMoeda'], {
      name: 'idx_tituloPagar_idMoeda',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['dataLancamento'], {
      name: 'idx_tituloPagar_dataLancamento',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['numeroTitulo', 'tenantId'], {
      unique: true,
      name: 'idx_tituloPagar_numeroTitulo_tenantId',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['status'], {
      name: 'idx_tituloPagar_status',
    });

    await queryInterface.addIndex('C019_tituloPagar', ['usercreation'], {
      name: 'idx_tituloPagar_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C019_tituloPagar');
}
