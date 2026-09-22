import { QueryInterface, DataTypes } from 'sequelize'

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.changeColumn('C064_configuracaoRecibo', 'logoBase64', {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    comment: 'Logo em base64 para impressão no recibo',
  })
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.changeColumn('C064_configuracaoRecibo', 'logoBase64', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Logo em base64 para impressão no recibo',
  })
}
