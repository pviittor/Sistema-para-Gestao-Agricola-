import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Renomear coluna idtenant para tenantId na tabela C001_PESSOA
 * 
 * Esta migration renomeia a coluna idtenant para tenantId na tabela C001_PESSOA
 * para seguir o padrão do projeto onde todas as tabelas usam tenantId.
 * 
 * IMPORTANTE: Esta migration deve ser executada após a criação da tabela C001_PESSOA.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna idtenant existe
  const columns = await queryInterface.sequelize.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C001_PESSOA' 
    AND COLUMN_NAME = 'idtenant';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const idtenantExists = columns && columns.length > 0;

  if (idtenantExists) {
    // Renomear a coluna idtenant para tenantId
    await queryInterface.renameColumn('C001_PESSOA', 'idtenant', 'tenantId');
    
    // Remover o índice antigo se existir
    try {
      await queryInterface.removeIndex('C001_PESSOA', 'idx_C001_PESSOA_idtenant');
    } catch (error) {
      // Índice pode não existir
    }

    // Criar novo índice com o nome correto
    await queryInterface.addIndex('C001_PESSOA', ['tenantId'], {
      name: 'idx_C001_PESSOA_tenantId',
    });
  } else {
    // Se idtenant não existe, verificar se tenantId já existe
    const tenantIdColumns = await queryInterface.sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'C001_PESSOA' 
      AND COLUMN_NAME = 'tenantId';
    `, {
      type: QueryTypes.SELECT,
    }) as any[];

    const tenantIdExists = tenantIdColumns && tenantIdColumns.length > 0;

    if (!tenantIdExists) {
      // Se nenhuma das colunas existe, criar tenantId
      await queryInterface.addColumn('C001_PESSOA', 'tenantId', {
        type: DataTypes.INTEGER,
        allowNull: true, // Será populado depois, depois será NOT NULL
        comment: 'ID do tenant ao qual a pessoa pertence',
      });

      await queryInterface.addIndex('C001_PESSOA', ['tenantId'], {
        name: 'idx_C001_PESSOA_tenantId',
      });
    }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna tenantId existe
  const columns = await queryInterface.sequelize.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C001_PESSOA' 
    AND COLUMN_NAME = 'tenantId';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tenantIdExists = columns && columns.length > 0;

  if (tenantIdExists) {
    // Renomear a coluna tenantId para idtenant
    await queryInterface.renameColumn('C001_PESSOA', 'tenantId', 'idtenant');
    
    // Remover o índice atual
    try {
      await queryInterface.removeIndex('C001_PESSOA', 'idx_C001_PESSOA_tenantId');
    } catch (error) {
      // Índice pode não existir
    }

    // Criar índice com o nome antigo
    await queryInterface.addIndex('C001_PESSOA', ['idtenant'], {
      name: 'idx_C001_PESSOA_idtenant',
    });
  }
}
