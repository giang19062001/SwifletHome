import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import { join } from 'path';
import { AppModule } from './app.module';
import { initSwagger } from './config/swagger.config';
import { LoggingService } from './common/logger/logger.service';
import { AllExceptionsFilter } from './filter/allException.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Tắt CSP để tránh chặn các thẻ script và sự kiện inline trong EJS
    }),
  );

  // bắt lỗi toàn cục
  const logger = app.get(LoggingService);
  app.useGlobalFilters(new AllExceptionsFilter(logger));


  //CORS
  app.enableCors({
    origin: [
      'https://3fam.ai',
      'https://3fam.vn',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

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
  await app.listen(process.env.PORT ?? '', '0.0.0.0');
}
bootstrap();
