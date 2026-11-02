import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ARTIC HUB API',
      version: '1.0.0',
      description: 'Full e-commerce REST API — Amazon-grade marketplace',
      contact: {
        name: 'ARTIC HUB',
        email: 'articltd1@gmail.com',
      },
    },
    servers: [
      { url: 'http://localhost:5010/api/v1', description: 'Development' },
      { url: 'http://102.37.128.81:5010/api/v1', description: 'Production' },
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
