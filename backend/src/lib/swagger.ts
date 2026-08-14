import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ARTIC Marketplace API',
      version: '1.0.0',
      description: 'Full e-commerce REST API — Amazon-grade marketplace',
      contact: {
        name: 'ARTIC Marketplace',
        email: 'api@articmarketplace.com',
      },
    },
    servers: [
      { url: 'http://localhost:5000/api/v1', description: 'Development' },
      { url: 'https://api.articmarketplace.com/api/v1', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export function setupSwagger(app: Express): void {
  const specs = swaggerJsdoc(options);
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'ARTIC API Docs',
    })
  );
}
