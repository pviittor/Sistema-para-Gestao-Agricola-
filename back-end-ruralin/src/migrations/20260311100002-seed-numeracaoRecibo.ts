import { QueryInterface } from 'sequelize';

/**
 * Seed reservado para NumeracaoRecibo.
 * A série inicial é criada pelo tenant admin via CRUD ou automaticamente
 * pelo ReciboService quando o primeiro recibo é emitido.
 */

export async function up(_queryInterface: QueryInterface): Promise<void> {
  // Sem seed de dados — séries são criadas sob demanda
}

export async function down(_queryInterface: QueryInterface): Promise<void> {
  // Nada a reverter
}
