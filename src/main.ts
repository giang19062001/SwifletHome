import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import expressLayouts from 'express-ejs-layouts';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { NotFoundExceptionFilter } from './filter/notFound';
import { initSwagger } from './config/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //CORS
  app.enableCors();
  
  // (CSS, JS, IMG), views , engine
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  app.use(expressLayouts);
  app.set('layout', 'layout/layout'); // file layout (views/layout/layout.ejs)

  // global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // filter
  app.useGlobalFilters(new NotFoundExceptionFilter());

  //cookie
  app.use(cookieParser());

  //session
  app.use(
    session({
      secret: 'secret-session-key',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60 * 60 * 1000 }, // 1 hrs
    }),
  );

  //swagger
  initSwagger(app)

  // port
  await app.listen(process.env.PORT ?? '');
}
bootstrap();
