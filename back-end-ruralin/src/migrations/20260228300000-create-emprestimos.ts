import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela emprestimos
 *
 * Esta migration cria a tabela emprestimos para registro de empréstimos
 * de produtos ou máquinas vinculados a fazendas e parceiros.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'emprestimos';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('emprestimos', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do empréstimo (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o empréstimo pertence',
      },
      fazendaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da fazenda vinculada ao empréstimo',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      parceiroId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do parceiro (pessoa) vinculado ao empréstimo',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      data_emp: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data do empréstimo',
      },
      devolucao_emp: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data prevista de devolução',
      },
      encerramento_emp: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de encerramento efetivo do empréstimo',
      },
      tipo_emp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tipo do empréstimo: 0=Produto, 1=Máquina',
      },
      situacao_emp: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Situação do empréstimo: 0=Em aberto, 1=Parcialmente devolvido, 2=Concluído',
      },
      observacao_emp: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações gerais sobre o empréstimo',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação do registro',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de última atualização do registro',
      },
    });

    // Criar índices
    await queryInterface.addIndex('emprestimos', ['tenantId'], {
      name: 'idx_emprestimos_tenantId',
    });

    await queryInterface.addIndex('emprestimos', ['fazendaId'], {
      name: 'idx_emprestimos_fazendaId',
    });

    await queryInterface.addIndex('emprestimos', ['parceiroId'], {
      name: 'idx_emprestimos_parceiroId',
    });

    await queryInterface.addIndex('emprestimos', ['situacao_emp'], {
      name: 'idx_emprestimos_situacao_emp',
    });

    await queryInterface.addIndex('emprestimos', ['data_emp'], {
      name: 'idx_emprestimos_data_emp',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('emprestimos');
}
