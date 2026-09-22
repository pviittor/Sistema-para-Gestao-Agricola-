import { QueryInterface, DataTypes } from 'sequelize'

/**
 * Migration para criar tabela C052_certificadoDigital
 *
 * Certificados digitais A1 por tenant para assinatura de NF-e.
 * Tabela multi-tenant.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('C052_certificadoDigital', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único do certificado digital',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant ao qual o certificado pertence',
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Nome identificador do certificado',
      },
      razao_social: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Razão social do titular do certificado',
      },
      cnpj_cpf: {
        type: DataTypes.STRING(18),
        allowNull: false,
        comment: 'CNPJ ou CPF do titular',
      },
      arquivo_path: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: 'Caminho no filesystem do arquivo .pfx',
      },
      senha: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Senha do certificado (texto plano conforme DA-03)',
      },
      data_validade: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de expiração do certificado',
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'ativo',
        comment: 'Status: ativo, expirado, revogado',
      },
      ambiente: {
        type: DataTypes.STRING(15),
        allowNull: false,
        defaultValue: 'homologacao',
        comment: 'Ambiente SEFAZ: homologacao, producao',
      },
      uf: {
        type: DataTypes.STRING(2),
        allowNull: false,
        comment: 'UF de emissão (ex: SP, MT, GO)',
      },
      padrao: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se é o certificado padrão do tenant para emissão',
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Certificado ativo para uso',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID do usuário que criou o registro',
        references: {
          model: 'usuarios',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação do registro',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de atualização',
      },
    })

    await queryInterface.addIndex('C052_certificadoDigital', ['tenantId'], {
      name: 'idx_certDigital_tenantId',
    })

    await queryInterface.addIndex('C052_certificadoDigital', ['cnpj_cpf'], {
      name: 'idx_certDigital_cnpj_cpf',
    })

    await queryInterface.addIndex('C052_certificadoDigital', ['status'], {
      name: 'idx_certDigital_status',
    })

    await queryInterface.addIndex('C052_certificadoDigital', ['ativo'], {
      name: 'idx_certDigital_ativo',
    })

    await queryInterface.addIndex('C052_certificadoDigital', ['padrao', 'tenantId'], {
      name: 'idx_certDigital_padrao_tenant',
    })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('C052_certificadoDigital')
}
