import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration: Criar tabela C053_registroArmazenagem
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('C053_registroArmazenagem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'ID único do registro de armazenagem',
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do tenant ao qual o registro pertence',
    },
    tipo: {
      type: DataTypes.ENUM('Carga', 'Descarga'),
      allowNull: false,
      comment: 'Tipo do registro: Carga ou Descarga',
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Data do registro',
    },
    hora: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora do registro',
    },
    idProduto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID do produto',
      references: {
        model: 'C008_produto',
        key: 'id_prod',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idUnidadeMedida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de medida',
      references: {
        model: 'C005_unidadeMedida',
        key: 'id_unidade',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idOrigem: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da origem (configurador de ciclo)',
      references: {
        model: 'C035_configuradorCiclo',
        key: 'id_cfg',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idUnidadeDeposito: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID da unidade de depósito',
      references: {
        model: 'C052_unidadeDeposito',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    idMotorista: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID do motorista (pessoa)',
      references: {
        model: 'C001_PESSOA',
        key: 'id_pessoa',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    ticket: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número do ticket',
    },
    peso_liquido: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      comment: 'Peso líquido',
    },
    desconto_umidade: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por umidade',
    },
    desconto_impureza: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por impureza',
    },
    desconto_avariados: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por avariados',
    },
    desconto_esverdeados: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por esverdeados',
    },
    desconto_quebra_tecnica: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por quebra técnica',
    },
    desconto_taxa_recepcao: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto por taxa de recepção',
    },
    desconto_total: {
      type: DataTypes.DECIMAL(18, 4),
      allowNull: false,
      defaultValue: 0,
      comment: 'Desconto total (calculado)',
    },
    observacoes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações gerais',
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

  // Índices individuais
  await queryInterface.addIndex('C053_registroArmazenagem', ['tenantId'], {
    name: 'idx_C053_registroArmazenagem_tenantId',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['idProduto'], {
    name: 'idx_C053_registroArmazenagem_idProduto',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['idUnidadeDeposito'], {
    name: 'idx_C053_registroArmazenagem_idUnidadeDeposito',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['idOrigem'], {
    name: 'idx_C053_registroArmazenagem_idOrigem',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['data'], {
    name: 'idx_C053_registroArmazenagem_data',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['tipo'], {
    name: 'idx_C053_registroArmazenagem_tipo',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['idMotorista'], {
    name: 'idx_C053_registroArmazenagem_idMotorista',
  });

  // Índices compostos
  await queryInterface.addIndex('C053_registroArmazenagem', ['tenantId', 'idUnidadeDeposito'], {
    name: 'idx_C053_registroArmazenagem_tenantId_idUnidadeDeposito',
  });

  await queryInterface.addIndex('C053_registroArmazenagem', ['tenantId', 'data'], {
    name: 'idx_C053_registroArmazenagem_tenantId_data',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remover índices compostos
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_tenantId_data');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_tenantId_idUnidadeDeposito');

  // Remover índices individuais
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_idMotorista');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_tipo');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_data');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_idOrigem');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_idUnidadeDeposito');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_idProduto');
  await queryInterface.removeIndex('C053_registroArmazenagem', 'idx_C053_registroArmazenagem_tenantId');

  await queryInterface.dropTable('C053_registroArmazenagem');
}
