import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C001_PESSOA
 * 
 * Esta migration cria a tabela C001_PESSOA com todos os campos necessários.
 * Se a tabela já existir, apenas adiciona o campo tenantId se não existir.
 * 
 * IMPORTANTE: Esta migration assume que a tabela pode já existir no banco.
 * Se a tabela não existir, ela será criada. Se existir, apenas adiciona tenantId.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C001_PESSOA';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    // Criar tabela completa
    await queryInterface.createTable('C001_PESSOA', {
      id_pessoa: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da pessoa (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Será populado depois, depois será NOT NULL
        comment: 'ID do tenant ao qual a pessoa pertence',
      },
      nomerazao_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Nome (pessoa física) ou razão social (pessoa jurídica)',
      },
      nomefantasia_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Nome fantasia (principalmente para pessoa jurídica)',
      },
      cpfcnpj_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'CPF (pessoa física) ou CNPJ (pessoa jurídica)',
      },
      nascimento_pessoa: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de nascimento (pessoa física) ou fundação (pessoa jurídica)',
      },
      contato_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Nome do contato da pessoa',
      },
      email_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Email de contato da pessoa',
      },
      identidade_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Número da identidade (RG)',
      },
      orgaoidentidade_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Órgão emissor da identidade',
      },
      caixapostal_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Caixa postal',
      },
      cep_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'CEP do endereço',
      },
      complemento_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Complemento do endereço',
      },
      certidaonegativa_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Certidão negativa',
      },
      codigoautorizacao_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Código de autorização',
      },
      cliente_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é cliente',
      },
      produtor_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é produtor',
      },
      portador_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é portador',
      },
      funcionario_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é funcionário',
      },
      fornecedor_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é fornecedor',
      },
      motorista_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é motorista',
      },
      operador_pessoa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Indica se a pessoa é operador',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou o registro',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação do registro',
      },
      idMunicipio: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do município',
      },
      tipo_pessoa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Tipo de pessoa: 1 = Pessoa Física (PF), 2 = Pessoa Jurídica (PJ)',
      },
      endereco_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Endereço completo da pessoa',
      },
      bairro_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Bairro do endereço',
      },
      numero_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Número do endereço',
      },
      telefone1_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Telefone principal de contato',
      },
      inscricaoEstadual_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Inscrição estadual (pessoa jurídica)',
      },
      observacao_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações gerais sobre a pessoa',
      },
      inscricaoMunicipal_pessoa: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Inscrição municipal (pessoa jurídica)',
      },
    });

    // Criar índice para tenantId
    await queryInterface.addIndex('C001_PESSOA', ['tenantId'], {
      name: 'idx_C001_PESSOA_tenantId',
    });

    // Criar índice para usercreation (FK)
    await queryInterface.addIndex('C001_PESSOA', ['usercreation'], {
      name: 'idx_C001_PESSOA_usercreation',
    });

    // Criar índice para tipo_pessoa (para buscas por tipo)
    await queryInterface.addIndex('C001_PESSOA', ['tipo_pessoa'], {
      name: 'idx_C001_PESSOA_tipo_pessoa',
    });
  } else {
    // Tabela já existe, apenas adicionar tenantId se não existir
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

    if (!tenantIdExists) {
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
  // Verificar se a tabela existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C001_PESSOA';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (tableExists) {
    // Remover índice de tenantId se existir
    try {
      await queryInterface.removeIndex('C001_PESSOA', 'idx_C001_PESSOA_tenantId');
    } catch (error) {
      // Índice pode não existir
    }

    // Remover coluna tenantId se existir
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
      await queryInterface.removeColumn('C001_PESSOA', 'tenantId');
    }

    // NOTA: Não removemos a tabela completa no down, pois ela pode ter dados importantes
    // Se necessário remover a tabela, fazer manualmente após backup
  }
}
