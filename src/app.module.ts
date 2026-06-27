import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from 'nestjs-prometheus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlacklistGuard } from './common/blacklist/blacklist.guard';
import { BlacklistModule } from './common/blacklist/blacklist.module';
import { CornModule } from './common/corn/corn.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { RedisModule } from './common/redis/redis.module';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';
import { LoggerModule } from './common/logger/logger.module';
import { MailModule } from './common/mail/mail.module';
import { MqttModule } from './common/mqtt/mqtt.module';
import { SocketModule } from './common/socket/socket.module';
import { GeoModule } from './common/geo/geo.module';
import { DatabaseModule } from './database/database.module';
import { PageNotFoundExceptionFilter } from './filter/pageNotFound.filter';
import { ROUTER } from './helpers/const.helper';
import { HttpMetricsInterceptor } from './interceptors/metrics.interceptor';
import { RequestLoggerInterceptor } from './interceptors/request.interceptor';
import { IpMiddleware } from './middleware/ip.middleware';
import { AnswerAdminModule } from './modules/answer/admin/answer.module';
import { AnswerAppModule } from './modules/answer/app/answer.module';
import { AuthAdminModule } from './modules/auth/admin/auth.module';
import { AuthAppModule } from './modules/auth/app/auth.module';
import { BlogAdminModule } from './modules/blog/admin/blog.module';
import { BlogAppModule } from './modules/blog/app/blog.module';
import { CategoryAdminModule } from './modules/category/admin/category.module';
import { CheckoutAppModule } from './modules/checkout/app/checkout.module';
import { ConsignmentAdminModule } from './modules/consigment/admin/consignment.module';
import { ConsignmentAppModile } from './modules/consigment/app/consigment.module';
import { DoctorAdminModule } from './modules/doctor/admin/doctor.module';
import { DoctorAppModule } from './modules/doctor/app/doctor.module';
import { EaterAppModule } from './modules/eater/app/eater.module';
import { GuestAdminModule } from './modules/guest/admin/guest.module';
import { GuestModule } from './modules/guest/front/guest.module';
import { HomeSaleAdminModule } from './modules/homeSale/admin/homeSale.module';
import { HomeSaleAppModule } from './modules/homeSale/app/homeSale.module';
import { SaleHomeAdminModule } from './modules/saleHome/admin/saleHome.module';
import { SaleHomeAppModule } from './modules/saleHome/app/saleHome.module';
import { InfoAdminModule } from './modules/info/admin/info.module';
import { NotificationAdminModule } from './modules/notification/admin/notification.module';
import { ObjectAdminModule } from './modules/object/admin/object.module';
import { OptionModule } from './modules/options/option.module';
import { PackageAdminModule } from './modules/package/admin/package.module';
import { PhoneCodeModule } from './modules/phoneCode/phoneCode.module';
import { ProvinceModule } from './modules/province/province.module';
import { QrAdminModule } from './modules/qr/admin/qr.module';
import { QrAppModule } from './modules/qr/app/qr.module';
import { QuestionAdminModule } from './modules/question/admin/question.module';
import { ReportAdminModule } from './modules/report/admin/report.module';
import { ReportAppModule } from './modules/report/app/report.module';
import { ScreenAdminModule } from './modules/screen/admin/screen.module';
import { ScreenAppModule } from './modules/screen/app/screen.module';
import { AdsAppModule } from './modules/ads/app/ads.module';
import { TeamAdminModule } from './modules/team/admin/team.module';
import { TeamAppModule } from './modules/team/app/team.module';
import { TodoAdminModule } from './modules/todo/admin/todo.module';
import { TodoAppModule } from './modules/todo/app/todo.module';
import { UploadAdminModule } from './modules/upload/admin/upload.module';
import { UserAdminModule } from './modules/user/admin/user.module';
import { UserHomeAdminModule } from './modules/userHome/admin/userHome.module';
import { UserHomeAppModule } from './modules/userHome/app/userHome.module';
import { ShareAppModule } from './modules/share/app/share.module';
import { AdsAdminModule } from './modules/ads/admin/ads.module';

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`, // phân biệt local hay production
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 phút
        limit: 300, // tối đa 300 request / 1 phút
      },
      {
        name: 'sensitive',
        ttl: 60000, // 1 phút
        limit: 30, // tối đa 30 request / 1 phút cho các API nhạy cảm
      },
    ]),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
    MqttModule,
    CornModule,
    DatabaseModule,
    LoggerModule,
    SocketModule,
    FirebaseModule,
    RedisModule,
    MailModule,
    MqttModule,
    BlacklistModule,
    GeoModule,
    // commmon
    OptionModule,
    ProvinceModule,
    PhoneCodeModule,
    //app
    AuthAppModule,
    AnswerAppModule,
    DoctorAppModule,
    HomeSaleAppModule,
    SaleHomeAppModule,
    ScreenAppModule,
    UserHomeAppModule,
    BlogAppModule,
    TodoAppModule,
    QrAppModule,
    TeamAppModule,
    ConsignmentAppModile,
    ReportAppModule,
    CheckoutAppModule,
    ShareAppModule,
    AdsAppModule,
    // front
    GuestModule,
    // eater - app
    EaterAppModule,
    //admin
    AuthAdminModule,
    UserAdminModule,
    CategoryAdminModule,
    ObjectAdminModule,
    QuestionAdminModule,
    AnswerAdminModule,
    UploadAdminModule,
    HomeSaleAdminModule,
    SaleHomeAdminModule,
    BlogAdminModule,
    DoctorAdminModule,
    ScreenAdminModule,
    InfoAdminModule,
    PackageAdminModule,
    UserHomeAdminModule,
    TodoAdminModule,
    NotificationAdminModule,
    QrAdminModule,
    TeamAdminModule,
    ConsignmentAdminModule,
    GuestAdminModule,
    ReportAdminModule,
    AdsAdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationPipe, // bật bắt lỗi tự động dựa vào cấu hình DTO
    },
    {
      provide: APP_FILTER,
      useClass: PageNotFoundExceptionFilter, // bắt lỗi tự động điều hướng sang trang 404.ejs
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggerInterceptor, // log cho các request gửi đến server
    },
    {
      provide: APP_GUARD,
      useClass: BlacklistGuard, // block IP blacklist
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard, // rate limit
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpMiddleware).forRoutes(`${ROUTER.APP}/*`, `${ROUTER.FRONT}/*`, `${ROUTER.EATER_APP}/*`); // bắt ip cho các route api cụ thể
  }
}
