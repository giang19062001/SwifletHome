import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const initSwagger = (app) => {
  const config = new DocumentBuilder()
    .setTitle('Swiftlet APIs')
    .setDescription('The Swiftlet API description')
    .setVersion('1.0')
    .addTag('APIs')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Admin token (cookie: swf-token)',
      },
      'admin-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'App token (Authorization header)',
      },
      'app-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: `
    .opblock-tag[data-tag^="app/"] {
      position: relative;
      padding-left: 30px;
    }

    .opblock-tag[data-tag^="app/"]::before {
      content: "✨";
      position: absolute;
      left: 0;
      top: 0;
      font-size: 20px;
    }
  `,
  });
};
