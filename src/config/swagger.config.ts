import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AUTH_CONFIG } from 'src/modules/auth/auth.config';

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
        description: `Admin token (cookie: ${AUTH_CONFIG.TOKEN_NAME})`,
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
  // custom sort tags
  document.tags = document.tags?.sort((a, b) => {
    const aIsApp = a.name.startsWith('app/');
    const bIsApp = b.name.startsWith('app/');

    if (aIsApp && !bIsApp) return -1;
    if (!aIsApp && bIsApp) return 1;

    return a.name.localeCompare(b.name);
  });
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
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
