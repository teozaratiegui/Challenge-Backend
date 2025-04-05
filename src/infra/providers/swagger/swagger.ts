import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'File Upload & Processing API',
    version: '1.0.0',
    description: 'API para subir archivos .xlsx, procesarlos y obtener resultados.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local',
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyUpload: {
        type: 'apiKey',
        in: 'header',
        name: 'api-key'
      },
      ApiKeyStatus: {
        type: 'apiKey',
        in: 'header',
        name: 'api-key'
      },
      ApiKeyData: {
        type: 'apiKey',
        in: 'header',
        name: 'api-key'
      }
    }
  },
  security: [{ ApiKeyAuth: [] }],
}

const options = {
  swaggerDefinition,
  apis: ['src/presentation/express/routers/*.ts'], // O donde tengas las anotaciones @swagger
}

const swaggerSpec = swaggerJSDoc(options)

export { swaggerUi, swaggerSpec }
