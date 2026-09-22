import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { configureSequelizeLogging, setupSlowQueryLogging } from '../core/logger/sequelizeLogger';

dotenv.config();

const dbName = process.env.DB_NAME || 'gmpr_qas';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'x1Qa#D&xkgIEDUA/2Zr&';
const dbHost = process.env.DB_HOST || '72.61.56.64';
const dbPort = process.env.DB_PORT || '3306';

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: Number(dbPort),
  logging: false, // Será configurado pelo configureSequelizeLogging
  dialect: 'mariadb',
  dialectOptions: {connectionTimeout: 1000*60},
  // Desabilitar sync automático - usar migrations em produção
  // sync: {
  //   force: false,
  //   alter: true,
  // },
});

// Configurar logging do Sequelize usando Logger Service
// Nota: configureSequelizeLogging será chamado após o container estar inicializado
// Por enquanto, logging está desabilitado. Será habilitado em server.ts após initializeContainer()

export default sequelize;

// Exportar função para configurar logging (será chamada após DI estar pronto)
export { configureSequelizeLogging, setupSlowQueryLogging };
