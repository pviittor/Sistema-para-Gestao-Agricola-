import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration 4 — Criar tabela recorrencia_financeira
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.createTable('recorrencia_financeira', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        comment: 'ID único da recorrência',
      },
      tenantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do tenant',
      },
      usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário criador',
      },
      tipo: {
        type: DataTypes.ENUM('PAGAR', 'RECEBER'),
        allowNull: false,
        comment: 'Tipo: PAGAR ou RECEBER',
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Descrição da recorrência',
      },
      valor: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Valor base de cada lançamento gerado',
      },
      periodicidade: {
        type: DataTypes.ENUM('SEMANAL', 'QUINZENAL', 'MENSAL', 'BIMESTRAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'SAFRA'),
        allowNull: false,
        comment: 'Periodicidade dos lançamentos',
      },
      diaVencimento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Dia do mês de vencimento (1-31)',
      },
      dataInicio: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Data de início da vigência',
      },
      dataFim: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data de encerramento (null = indefinida)',
      },
      ativa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indica se está ativa para geração automática',
      },
      idFornecedorCliente: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Pessoa vinculada (fornecedor/cliente)',
      },
      idPortador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Pessoa portadora (obtida do cabeçalho)',
      },
      idProdutor: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Pessoa produtora (obtida do cabeçalho)',
      },
      idContaDebCred: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Conta bancária/caixa padrão',
      },
      idPlanoContaGerencial: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Plano de conta gerencial padrão',
      },
      idCentroCusto: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Centro de custo padrão',
      },
      idFazenda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Fazenda vinculada',
      },
      idSafra: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Safra vinculada',
      },
      idTalhao: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Talhão vinculado',
      },
      idMoeda: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Moeda dos lançamentos',
      },
      antecedenciaGeracaoDias: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: 'Dias de antecedência para geração do título',
      },
      numeroMaximoGeracoes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Máximo de títulos a gerar (null = ilimitado)',
      },
      geracoesRealizadas: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Contador de títulos já gerados',
      },
      observacao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações adicionais',
      },
      usercreation: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID do usuário que criou',
      },
      datecreation: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Data de criação',
      },
    });

    await queryInterface.addIndex('recorrencia_financeira', ['tenantId'], { name: 'idx_recorrencia_tenantId' });
    await queryInterface.addIndex('recorrencia_financeira', ['tipo'], { name: 'idx_recorrencia_tipo' });
    await queryInterface.addIndex('recorrencia_financeira', ['ativa'], { name: 'idx_recorrencia_ativa' });
    await queryInterface.addIndex('recorrencia_financeira', ['tenantId', 'ativa', 'dataInicio'], { name: 'idx_recorrencia_scheduler' });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.dropTable('recorrencia_financeira');
}
