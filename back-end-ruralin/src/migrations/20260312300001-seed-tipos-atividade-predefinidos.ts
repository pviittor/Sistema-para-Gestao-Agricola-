import { QueryInterface, QueryTypes } from 'sequelize';

/**
 * Seed de tipos de atividade pré-definidos (templates globais).
 * tenantId = NULL indica que são templates disponíveis para todos os tenants.
 * Inclui campos condicionais associados a cada tipo de atividade.
 *
 * Primeiro altera tenantId para permitir NULL nas tabelas C066 e C067,
 * depois insere os templates globais.
 *
 * Idempotente: verifica existência antes de inserir.
 */

interface TipoAtividadeSeed {
  nome: string;
  categoria: string;
  icone: string;
  cor: string;
  campos: {
    nomeCampo: string;
    rotulo: string;
    tipoCampo: string;
    unidade: string | null;
    opcoes: string[] | null;
    ordem: number;
  }[];
}

const TIPOS_ATIVIDADE: TipoAtividadeSeed[] = [
  {
    nome: 'Plantio',
    categoria: 'AGRICOLA',
    icone: 'wheat',
    cor: '#22C55E',
    campos: [
      { nomeCampo: 'espacamento', rotulo: 'Espaçamento', tipoCampo: 'NUMBER', unidade: 'm', opcoes: null, ordem: 1 },
      { nomeCampo: 'profundidade', rotulo: 'Profundidade', tipoCampo: 'NUMBER', unidade: 'cm', opcoes: null, ordem: 2 },
      { nomeCampo: 'populacao', rotulo: 'População', tipoCampo: 'NUMBER', unidade: 'plantas/ha', opcoes: null, ordem: 3 },
    ],
  },
  {
    nome: 'Pulverização',
    categoria: 'AGRICOLA',
    icone: 'spray-can',
    cor: '#EF4444',
    campos: [
      { nomeCampo: 'volumeCalda', rotulo: 'Volume de Calda', tipoCampo: 'NUMBER', unidade: 'L/ha', opcoes: null, ordem: 1 },
      { nomeCampo: 'doseHa', rotulo: 'Dose por Hectare', tipoCampo: 'NUMBER', unidade: 'kg ou L/ha', opcoes: null, ordem: 2 },
      { nomeCampo: 'condicoesClimaticas', rotulo: 'Condições Climáticas', tipoCampo: 'SELECT', unidade: null, opcoes: ['Ideal', 'Aceitavel', 'Desfavoravel'], ordem: 3 },
      { nomeCampo: 'velocidadeVento', rotulo: 'Velocidade do Vento', tipoCampo: 'NUMBER', unidade: 'km/h', opcoes: null, ordem: 4 },
    ],
  },
  {
    nome: 'Colheita',
    categoria: 'AGRICOLA',
    icone: 'scissors',
    cor: '#F59E0B',
    campos: [
      { nomeCampo: 'produtividadeHa', rotulo: 'Produtividade por Hectare', tipoCampo: 'NUMBER', unidade: 'kg/ha', opcoes: null, ordem: 1 },
      { nomeCampo: 'umidade', rotulo: 'Umidade', tipoCampo: 'NUMBER', unidade: '%', opcoes: null, ordem: 2 },
      { nomeCampo: 'impureza', rotulo: 'Impureza', tipoCampo: 'NUMBER', unidade: '%', opcoes: null, ordem: 3 },
    ],
  },
  {
    nome: 'Irrigação',
    categoria: 'AGRICOLA',
    icone: 'droplets',
    cor: '#3B82F6',
    campos: [
      { nomeCampo: 'volumeAgua', rotulo: 'Volume de Água', tipoCampo: 'NUMBER', unidade: 'L', opcoes: null, ordem: 1 },
      { nomeCampo: 'duracaoHoras', rotulo: 'Duração', tipoCampo: 'NUMBER', unidade: 'h', opcoes: null, ordem: 2 },
      { nomeCampo: 'lamina', rotulo: 'Lâmina', tipoCampo: 'NUMBER', unidade: 'mm', opcoes: null, ordem: 3 },
    ],
  },
  {
    nome: 'Adubação',
    categoria: 'AGRICOLA',
    icone: 'flask-round',
    cor: '#8B5CF6',
    campos: [
      { nomeCampo: 'doseHa', rotulo: 'Dose por Hectare', tipoCampo: 'NUMBER', unidade: 'kg/ha', opcoes: null, ordem: 1 },
      { nomeCampo: 'metodoAplicacao', rotulo: 'Método de Aplicação', tipoCampo: 'SELECT', unidade: null, opcoes: ['Lanço', 'Sulco', 'Foliar', 'Fertirrigação'], ordem: 2 },
    ],
  },
];

export async function up(queryInterface: QueryInterface): Promise<void> {
  const seq = queryInterface.sequelize;

  // Permitir tenantId NULL nas tabelas de tipo de atividade e campos condicionais (para templates globais)
  // Usa raw SQL para evitar errno 150 causado por changeColumn recriando FK constraints
  const tenantRows = await seq.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'C066_tipoAtividadeOS'
       AND COLUMN_NAME = 'tenantId'`,
    { type: QueryTypes.SELECT }
  ) as any[];
  const tenantColType = tenantRows[0]?.COLUMN_TYPE || 'int(11)';

  await seq.query(
    `ALTER TABLE C066_tipoAtividadeOS MODIFY COLUMN tenantId ${tenantColType} NULL`
  );
  await seq.query(
    `ALTER TABLE C067_campoCondicionalTipoAtividade MODIFY COLUMN tenantId ${tenantColType} NULL`
  );

  for (const tipo of TIPOS_ATIVIDADE) {
    // Verificar se já existe um template global com este nome
    const existing: any[] = await seq.query(
      `SELECT id FROM C066_tipoAtividadeOS WHERE tenantId IS NULL AND nome = :nome LIMIT 1`,
      { replacements: { nome: tipo.nome }, type: QueryTypes.SELECT }
    );

    let tipoId: number;

    if (existing.length > 0) {
      tipoId = existing[0].id;
    } else {
      // Inserir tipo de atividade com tenantId = NULL (template global)
      const [result]: any = await seq.query(
        `INSERT INTO C066_tipoAtividadeOS (tenantId, nome, descricao, categoria, icone, cor, ativo, createdAt, updatedAt)
         VALUES (NULL, :nome, :descricao, :categoria, :icone, :cor, 1, NOW(), NOW())`,
        {
          replacements: {
            nome: tipo.nome,
            descricao: `Atividade pré-definida: ${tipo.nome}`,
            categoria: tipo.categoria,
            icone: tipo.icone,
            cor: tipo.cor,
          },
          type: QueryTypes.INSERT,
        }
      );
      tipoId = result;
    }

    // Inserir campos condicionais (idempotente por nomeCampo + tipoAtividadeOSId)
    for (const campo of tipo.campos) {
      const campoExistente: any[] = await seq.query(
        `SELECT id FROM C067_campoCondicionalTipoAtividade
         WHERE tipoAtividadeOSId = :tipoId AND nomeCampo = :nomeCampo AND tenantId IS NULL LIMIT 1`,
        { replacements: { tipoId, nomeCampo: campo.nomeCampo }, type: QueryTypes.SELECT }
      );

      if (campoExistente.length === 0) {
        await seq.query(
          `INSERT INTO C067_campoCondicionalTipoAtividade
           (tenantId, tipoAtividadeOSId, nomeCampo, rotulo, tipoCampo, obrigatorio, opcoes, unidade, ordem, ativo, createdAt, updatedAt)
           VALUES (NULL, :tipoId, :nomeCampo, :rotulo, :tipoCampo, 0, :opcoes, :unidade, :ordem, 1, NOW(), NOW())`,
          {
            replacements: {
              tipoId,
              nomeCampo: campo.nomeCampo,
              rotulo: campo.rotulo,
              tipoCampo: campo.tipoCampo,
              opcoes: campo.opcoes ? JSON.stringify(campo.opcoes) : null,
              unidade: campo.unidade,
              ordem: campo.ordem,
            },
            type: QueryTypes.INSERT,
          }
        );
      }
    }
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const seq = queryInterface.sequelize;

  // Deletar campos condicionais dos templates globais
  await seq.query(
    `DELETE FROM C067_campoCondicionalTipoAtividade WHERE tenantId IS NULL`,
    { type: QueryTypes.DELETE }
  );

  // Deletar tipos de atividade templates globais
  await seq.query(
    `DELETE FROM C066_tipoAtividadeOS WHERE tenantId IS NULL`,
    { type: QueryTypes.DELETE }
  );

  // Restaurar tenantId NOT NULL (raw SQL para evitar errno 150)
  const tenantRows = await seq.query(
    `SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'C066_tipoAtividadeOS'
       AND COLUMN_NAME = 'tenantId'`,
    { type: QueryTypes.SELECT }
  ) as any[];
  const tenantColType = tenantRows[0]?.COLUMN_TYPE || 'int(11)';

  await seq.query(
    `ALTER TABLE C067_campoCondicionalTipoAtividade MODIFY COLUMN tenantId ${tenantColType} NOT NULL`
  );
  await seq.query(
    `ALTER TABLE C066_tipoAtividadeOS MODIFY COLUMN tenantId ${tenantColType} NOT NULL`
  );
}
