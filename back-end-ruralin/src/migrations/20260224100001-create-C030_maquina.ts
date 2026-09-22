import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Criar tabela C030_maquina
 *
 * Esta migration cria a tabela C030_maquina para gerenciamento de máquinas, veículos e implementos agrícolas.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a tabela já existe
  const tables = await queryInterface.sequelize.query(`
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'C030_maquina';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const tableExists = tables && tables.length > 0;

  if (!tableExists) {
    await queryInterface.createTable('C030_maquina', {
      id_mqn: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da máquina (auto-increment)',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual a máquina pertence',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição/nome da máquina',
      },
      chassi: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número do chassi',
      },
      placa: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Placa do veículo',
      },
      ano: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Ano de fabricação',
      },
      modelo: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Modelo da máquina',
      },
      serie: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Número de série',
      },
      marca: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Marca da máquina',
      },
      idGrupoEquipamento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do grupo de equipamento',
        references: {
          model: 'C029_grupoEquipamento',
          key: 'id_grpequip',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      tipoMarcador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tipo de marcador (1-Horímetro, 2-Odômetro, 3-Nenhum)',
      },
      combustivel: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tipo de combustível (1-Gasolina, 2-Diesel, 3-Etanol, 4-Gás, 5-Elétrico, 6-Híbrido)',
      },
      tipo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Tipo da máquina (1-Máquina, 2-Veículo, 3-Implemento)',
      },
      dataAquisicao: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de aquisição',
      },
      valorAquisicao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor de aquisição',
      },
      valorAtual: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor atual da máquina',
      },
      idFornecedor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do fornecedor (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      notaFiscal: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Número da nota fiscal',
      },
      serieNotaFiscal: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Série da nota fiscal',
      },
      dataNotaFiscal: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data da nota fiscal',
      },
      vidaUtil: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Vida útil em anos',
      },
      percsucata: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Percentual de sucata',
      },
      depreciacaoAnual: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor de depreciação anual',
      },
      horaUtilAno: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Horas úteis por ano',
      },
      horimetroInicial: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Horímetro inicial',
      },
      ultimoHorimetro: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Último horímetro registrado',
      },
      horimetroAbastecimento: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Horímetro de abastecimento',
      },
      horimetroManutencao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Horímetro de manutenção',
      },
      horimetroApontamento: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Horímetro de apontamento',
      },
      custoFixo: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Se utiliza custo fixo',
      },
      valorCustoFixo: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor do custo fixo',
      },
      valorConsumoFixo: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor do consumo fixo',
      },
      custoDepreciacao: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Se utiliza custo de depreciação',
      },
      valorHoraDepreciacao: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor hora de depreciação',
      },
      custoManutencao: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Se utiliza custo de manutenção',
      },
      custoCombustivel: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Se utiliza custo de combustível',
      },
      valorHora: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Valor da hora da máquina',
      },
      consumoEstimadoCombustivel: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Consumo estimado de combustível',
      },
      idCombustivelMaquina: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do produto combustível',
        references: {
          model: 'C008_produto',
          key: 'id_prod',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da fazenda',
        references: {
          model: 'C018_fazenda',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
      consumoHA: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Consumo por hectare',
      },
      custoHA: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Custo por hectare',
      },
      tara: {
        type: DataTypes.DECIMAL(18, 4),
        allowNull: true,
        comment: 'Tara da máquina (peso)',
      },
      utilizarTaraPesagem: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        comment: 'Se utiliza tara na pesagem',
      },
      idSeguradora: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID da seguradora (pessoa)',
        references: {
          model: 'C001_PESSOA',
          key: 'id_pessoa',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      inicioSeguro: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de início do seguro',
      },
      fimSeguro: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de fim do seguro',
      },
      aplice: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Número da apólice de seguro',
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
    await queryInterface.addIndex('C030_maquina', ['tenantId'], {
      name: 'idx_maquina_tenantId',
    });

    await queryInterface.addIndex('C030_maquina', ['idGrupoEquipamento'], {
      name: 'idx_maquina_idGrupoEquipamento',
    });

    await queryInterface.addIndex('C030_maquina', ['idFornecedor'], {
      name: 'idx_maquina_idFornecedor',
    });

    await queryInterface.addIndex('C030_maquina', ['idMotorista'], {
      name: 'idx_maquina_idMotorista',
    });

    await queryInterface.addIndex('C030_maquina', ['idFazenda'], {
      name: 'idx_maquina_idFazenda',
    });

    await queryInterface.addIndex('C030_maquina', ['placa'], {
      name: 'idx_maquina_placa',
    });

    await queryInterface.addIndex('C030_maquina', ['usercreation'], {
      name: 'idx_maquina_usercreation',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C030_maquina');
}
