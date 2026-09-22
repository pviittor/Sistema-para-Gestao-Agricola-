import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';

/**
 * Migration: Adicionar campo consultoriaId em usuarios
 * 
 * Esta migration adiciona o campo consultoriaId na tabela usuarios
 * para associar usuários do tipo CONSULTOR a uma consultoria.
 */
export async function up(queryInterface: QueryInterface): Promise<void> {
  // Verificar se a coluna já existe
  const columns = await queryInterface.sequelize.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'usuarios' 
    AND COLUMN_NAME = 'consultoriaId';
  `, {
    type: QueryTypes.SELECT,
  }) as any[];

  const columnExists = columns && columns.length > 0;

  if (!columnExists) {
    // Adicionar coluna sem foreign key constraint e sem índice
    // para evitar erro "Too many keys" (limite de 64 chaves do MariaDB)
    // A integridade referencial será mantida no nível da aplicação
    // NOTA: A coluna será criada sem índice, o que pode impactar performance
    // mas é necessário devido ao limite de chaves da tabela usuarios
    await queryInterface.addColumn('usuarios', 'consultoriaId', {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da consultoria à qual o usuário CONSULTOR pertence',
      // Não incluir references (foreign key) nem criar índice
      // para evitar ultrapassar o limite de 64 chaves do MariaDB
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  // Remover índice apenas se existir (pode não existir devido ao limite de chaves)
  try {
    await queryInterface.removeIndex('usuarios', 'idx_usuario_consultoriaId');
  } catch (error) {
    // Índice pode não existir, ignorar erro
  }
  await queryInterface.removeColumn('usuarios', 'consultoriaId');
}
