import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api', // define api folder under app structure
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Portfolio API',
        version: '1.0.0',
        description: 'API Documentation for Portfolio CMS',
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
