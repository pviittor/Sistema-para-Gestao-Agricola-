import 'reflect-metadata';
import app from "./app";
import sequelize, { configureSequelizeLogging, setupSlowQueryLogging } from "./config/database";
import dotenv from "dotenv";
import { initializeContainer, container } from "./core/di/container";
import { TYPES } from "./core/di/types";
import { ICacheSyncService } from "./core/cache/ICacheSyncService";

dotenv.config();

// Inicializar container de Dependency Injection
initializeContainer();

// Configurar logging do Sequelize após container estar inicializado
configureSequelizeLogging(sequelize);
setupSlowQueryLogging(sequelize, 1000); // Threshold de 1 segundo para queries lentas

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Connection to database has been established successfully.");

    // Sync models desabilitado - usar migrations em produção
    // await sequelize.sync();
    // console.log("Database synced.");
    
    // Em desenvolvimento, você pode usar sync() com alter: false para não modificar o schema
    // Em produção, sempre use migrations: npx sequelize-cli db:migrate
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SYNC === 'true') {
      await sequelize.sync({ alter: false });
      console.log("Database synced (alter: false - no schema changes).");
    } else {
      console.log("Database sync disabled. Use migrations to manage schema changes.");
    }

    // Inicializar Cache Sync Service se disponível
    try {
      const cacheSyncService = container.resolve<ICacheSyncService>(TYPES.ICacheSyncService);
      await cacheSyncService.start();
      console.log("Cache Sync Service started.");
    } catch (error) {
      // Cache Sync Service pode não estar disponível se Redis não estiver configurado
      console.log("Cache Sync Service not available (Redis may not be configured).");
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

startServer();
