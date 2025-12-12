import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { initSwagger } from './config/swagger.config';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  //CORS
  app.enableCors();

  // IP -> trust NGINX
  app.set('trust proxy', true);


  // (CSS, JS, IMG), views , engine
 app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.use(expressLayouts);
  app.set('layout', 'layout/layout'); // file layout (views/layout/layout.ejs)

  //cookie
  app.use(cookieParser());

  //session
  app.use(
    session({
      secret: configService.get<string>('SESSION_KEY') ?? '',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1 hrs
    }),
  );

  //swagger
  initSwagger(app);

  // port
  await app.listen(process.env.PORT ?? '');
}
bootstrap();
