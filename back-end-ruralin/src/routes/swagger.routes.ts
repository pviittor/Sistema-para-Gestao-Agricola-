import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swagger';

const router = Router();

/**
 * GET /api-docs
 * 
 * Endpoint para acessar a documentação interativa do Swagger UI.
 * 
 * Acesse http://localhost:3000/api-docs para visualizar a documentação.
 */
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RuralIn API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
}));

/**
 * GET /api-docs.json
 * 
 * Endpoint para obter a especificação OpenAPI em formato JSON.
 * Útil para integração com ferramentas externas ou geração de SDKs.
 */
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

export default router;
