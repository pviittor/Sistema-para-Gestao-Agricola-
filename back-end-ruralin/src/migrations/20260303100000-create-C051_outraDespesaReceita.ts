import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C051_outraDespesaReceita
 *
 * Esta migration cria a tabela C051_outraDespesaReceita para registro de
 * outras despesas e receitas vinculadas a planos gerenciais.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C051_outraDespesaReceita';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C051_outraDespesaReceita', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da outra despesa/receita (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o registro pertence',
      },
      planoGerencialId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do plano de conta gerencial',
        references: {
          model: 'C013_planoContaGerencial',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      dataMovimento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do movimento',
      },
      valor: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        comment: 'Valor da despesa/receita (mínimo 0.01)',
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações gerais',
      },
      tipo: {
        type: DataTypes.ENUM('RECEITA', 'DESPESA'),
        allowNull: false,
        comment: 'Tipo do lançamento: RECEITA ou DESPESA',
      },
      tipoAlocacao: {
        type: DataTypes.ENUM('PROPRIEDADE', 'CONFIGURADOR_CICLO'),
        allowNull: false,
        comment: 'Tipo de alocação: PROPRIEDADE ou CONFIGURADOR_CICLO',
      },
      configuradorCicloId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do configurador de ciclo (obrigatório quando tipoAlocacao = CONFIGURADOR_CICLO)',
        references: {
          model: 'C035_configuradorCiclo',
          key: 'id_cfg',
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
    await queryInterface.addIndex('C051_outraDespesaReceita', ['tenantId'], {
      name: 'idx_outraDespesaReceita_tenantId',
    });

    await queryInterface.addIndex('C051_outraDespesaReceita', ['planoGerencialId'], {
      name: 'idx_outraDespesaReceita_planoGerencialId',
    });

    await queryInterface.addIndex('C051_outraDespesaReceita', ['dataMovimento'], {
      name: 'idx_outraDespesaReceita_dataMovimento',
    });

    await queryInterface.addIndex('C051_outraDespesaReceita', ['tipo'], {
      name: 'idx_outraDespesaReceita_tipo',
    });

    await queryInterface.addIndex('C051_outraDespesaReceita', ['tipoAlocacao'], {
      name: 'idx_outraDespesaReceita_tipoAlocacao',
    });

    await queryInterface.addIndex('C051_outraDespesaReceita', ['configuradorCicloId'], {
      name: 'idx_outraDespesaReceita_configuradorCicloId',
    });

    await queryInterface.addIndex('C051_outraDespesaReceita', ['usercreation'], {
      name: 'idx_outraDespesaReceita_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C051_outraDespesaReceita');
}
