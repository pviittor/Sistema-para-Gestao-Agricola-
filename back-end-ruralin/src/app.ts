import express from 'express';
import cors from 'cors';
import routes from './routes';
import swaggerRoutes from './routes/swagger.routes';
import { errorHandler } from './middleware/errorHandler';
import { requestContextMiddleware } from './middleware/requestContext';
import { performanceLoggerMiddleware } from './middleware/performanceLogger';

const app = express();

// Configurar Express para confiar em proxies (necessário para req.ip funcionar corretamente)
// Isso permite que req.ip funcione corretamente quando há proxies/load balancers
app.set('trust proxy', true);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// RequestContext deve ser um dos primeiros middlewares
// para que esteja disponível em toda a requisição
app.use(requestContextMiddleware);

// Performance Logger deve vir após RequestContext para ter acesso ao contexto
app.use(performanceLoggerMiddleware);

// Swagger UI - Documentação da API (acessível sem autenticação)
app.use('/api-docs', swaggerRoutes);

app.use('/api', routes);

// ErrorHandler deve ser o último middleware adicionado
app.use(errorHandler);

export default app;
