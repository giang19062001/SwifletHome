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
import { ServerExceptionsFilter } from './filter/serverException.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // security headers
  app.use(
    helmet({
      // Tắt CSP để tránh chặn inline JS/CSS, CDN hoặc ảnh từ bên ngoài trên giao diện EJS Dashboard
      contentSecurityPolicy: false, 

      // Cho phép chia sẻ tài nguyên với các origin khác (Frontend Web, Mobile App, Webhook của Third-party)
      crossOriginResourcePolicy: { policy: 'cross-origin' }, 

      // Tắt COEP để tránh chặn load các tài nguyên (ảnh, script) từ domain khác trên Dashboard
      crossOriginEmbedderPolicy: false, 

      // Tắt COOP để tránh lỗi khi tương tác với các window popup cross-origin (như Oauth, payment)
      crossOriginOpenerPolicy: false, 
    }),
  );

  // Ghi log lỗi toàn cục
  const logger = app.get(LoggingService);
  app.useGlobalFilters(new ServerExceptionsFilter(logger));


  //CORS
  const corsOrigins = configService.get<string>('CORS_ORIGINS') || '';
  app.enableCors({
    origin: corsOrigins.split(',').map((origin) => origin.trim()),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With, Origin',
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
  console.log('NODE_ENV ==>', process.env.NODE_ENV);
  console.log('PORT ==>', process.env.PORT);
  console.log('DB_HOST ==>', process.env.DB_HOST);


}
bootstrap();
