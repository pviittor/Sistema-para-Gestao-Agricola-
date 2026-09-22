import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C018_fazenda
 * 
 * Esta migration cria a tabela C018_fazenda para gerenciamento de fazendas agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.TABLES 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'C018_fazenda';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C018_fazenda', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da fazenda (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a fazenda pertence',
      },
      idPessoa: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID da pessoa (produtor) proprietária da fazenda',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição/nome da fazenda',
      },
      endereco: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Endereço da fazenda',
      },
      complemento: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Complemento do endereço',
      },
      idMunicipio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do município onde a fazenda está localizada',
        references: {
          model: 'C015_municipio',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      inscricaoEstadual: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Inscrição estadual da fazenda',
      },
      areaTotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Área total da fazenda em hectares',
      },
      areaCultivada: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Área cultivada em hectares',
      },
      reservaLegal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Reserva legal em hectares',
      },
      telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Telefone de contato da fazenda',
      },
      gerente: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Nome do gerente da fazenda',
      },
      matricula: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Matrícula do imóvel',
      },
      livro: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Livro da matrícula',
      },
      folha: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Folha da matrícula',
      },
      itr: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'ITR (Imposto Territorial Rural)',
      },
      cei: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'CEI (Cadastro Específico do INSS)',
      },
      lcdprTipoExploracao: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tipo de exploração LCDPR (1-Exploração individual, 2-Condomínio, 3-Imóvel arrendado, 4-Parceria, 5-Comodato)',
      },
      lcdprParticipacao: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Participação na exploração (percentual)',
      },
      arrendada: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se a fazenda é arrendada',
      },
      idPessoaArrendamento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da pessoa (arrendador) quando a fazenda é arrendada',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      documento: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Documento do arrendamento',
      },
      dataInicio: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de início do arrendamento',
      },
      dataFim: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de fim do arrendamento',
      },
      observacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações gerais sobre a fazenda',
      },
      movimentaLCDPR: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se a fazenda movimenta LCDPR',
      },
      movimentaGado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se a fazenda movimenta gado',
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
    await queryInterface.addIndex('C018_fazenda', ['tenantId'], {
      name: 'idx_fazenda_tenantId',
    });

    await queryInterface.addIndex('C018_fazenda', ['idPessoa'], {
      name: 'idx_fazenda_idPessoa',
    });

    await queryInterface.addIndex('C018_fazenda', ['idMunicipio'], {
      name: 'idx_fazenda_idMunicipio',
    });

    await queryInterface.addIndex('C018_fazenda', ['idPessoaArrendamento'], {
      name: 'idx_fazenda_idPessoaArrendamento',
    });

    await queryInterface.addIndex('C018_fazenda', ['usercreation'], {
      name: 'idx_fazenda_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C018_fazenda');
}
