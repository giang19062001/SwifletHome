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
      },
      'swf-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    customCss: `
    .opblock-tag[data-tag^="app/"] {
      color: darkorchid !important;
    }
  `,
  });
};
