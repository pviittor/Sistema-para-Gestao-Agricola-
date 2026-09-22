import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
    // Buscar todos os tenants existentes
    const tenants: any[] = await queryInterface.sequelize.query(
      'SELECT id FROM C012_tenant',
      { type: 'SELECT' as any }
    );

    for (const tenant of tenants) {
      // Série 1, Modelo 55 (NF-e)
      const [existing55]: any[] = await queryInterface.sequelize.query(
        `SELECT id FROM C055_numeracaoNfe WHERE tenantId = ${tenant.id} AND serie = '1' AND modelo = '55'`,
        { type: 'SELECT' as any }
      );
      if (!existing55) {
        await queryInterface.bulkInsert('C055_numeracaoNfe', [{
          tenantId: tenant.id,
          serie: '1',
          modelo: '55',
          ultimo_numero: 0,
          ativo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }

      // Série 1, Modelo 65 (NFC-e)
      const [existing65]: any[] = await queryInterface.sequelize.query(
        `SELECT id FROM C055_numeracaoNfe WHERE tenantId = ${tenant.id} AND serie = '1' AND modelo = '65'`,
        { type: 'SELECT' as any }
      );
      if (!existing65) {
        await queryInterface.bulkInsert('C055_numeracaoNfe', [{
          tenantId: tenant.id,
          serie: '1',
          modelo: '65',
          ultimo_numero: 0,
          ativo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('C055_numeracaoNfe', {});
}
