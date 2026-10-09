import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggingService } from './common/logger/logger.service';
import { MinioService } from './common/minio/minio.service';
import { initSwagger } from './config/swagger.config';
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

  // 1. Phục vụ toàn bộ file /uploads/* trực tiếp từ MinIO (lưu trữ duy nhất trên MinIO)
  app.use('/uploads', async (req: any, res: any, next: any) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }
    const minio = MinioService.getInstance();
    if (!minio) return next();

    try {
      const stat = await minio.statObject(req.path);
      if (!stat) return next();

      if (stat.metaData && stat.metaData['content-type']) {
        res.setHeader('Content-Type', stat.metaData['content-type']);
      }
      res.setHeader('Content-Length', stat.size);
      if (stat.lastModified) {
        res.setHeader('Last-Modified', stat.lastModified.toUTCString());
      }
      res.setHeader('Cache-Control', 'public, max-age=2592000');

      if (req.method === 'HEAD') {
        return res.end();
      }

      const stream = await minio.getObjectStream(req.path);
      return stream.pipe(res);
    } catch {
      return next();
    }
  });

  // 2. Phục vụ tài nguyên tĩnh giao diện (CSS, JS, Fonts) từ thư mục public
  app.useStaticAssets(join(process.cwd(), 'public'));

  app.setBaseViewsDir(join(process.cwd(), 'views'));
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
