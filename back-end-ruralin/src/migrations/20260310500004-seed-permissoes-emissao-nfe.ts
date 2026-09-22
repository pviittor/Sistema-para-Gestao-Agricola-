import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
    const permissoes = [
      'nota_fiscal.emit',
      'nota_fiscal.contingencia',
    ];

    for (const nome of permissoes) {
      const [existing]: any[] = await queryInterface.sequelize.query(
        `SELECT id FROM permissoes WHERE nome = '${nome}'`,
        { type: 'SELECT' as any }
      );
      if (!existing) {
        await queryInterface.bulkInsert('permissoes', [{
          nome,
          createdAt: new Date(),
          updatedAt: new Date(),
        }]);
      }
    }

    const [rootRole]: any[] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE nome = 'ROOT'`,
      { type: 'SELECT' as any }
    );

    if (rootRole) {
      for (const nome of permissoes) {
        const [perm]: any[] = await queryInterface.sequelize.query(
          `SELECT id FROM permissoes WHERE nome = '${nome}'`,
          { type: 'SELECT' as any }
        );
        if (perm) {
          const [existingLink]: any[] = await queryInterface.sequelize.query(
            `SELECT id FROM role_has_permissao WHERE roleId = ${rootRole.id} AND permissaoId = ${perm.id}`,
            { type: 'SELECT' as any }
          );
          if (!existingLink) {
            await queryInterface.bulkInsert('role_has_permissao', [{
              roleId: rootRole.id,
              permissaoId: perm.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            }]);
          }
        }
      }
    }
}

export async function down(queryInterface: QueryInterface) {
  const permissoes = ['nota_fiscal.emit', 'nota_fiscal.contingencia'];
  for (const nome of permissoes) {
    await queryInterface.sequelize.query(`DELETE FROM role_has_permissao WHERE permissaoId IN (SELECT id FROM permissoes WHERE nome = '${nome}')`);
    await queryInterface.sequelize.query(`DELETE FROM permissoes WHERE nome = '${nome}'`);
  }
}
