import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from 'nestjs-prometheus';
import { HttpMetricsInterceptor } from './interceptors/metrics.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CornModule } from './common/corn/corn.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { LoggerModule } from './common/logger/logger.module';
import { MqttModule } from './common/mqtt/mqtt.module';
import { SocketModule } from './common/socket/socket.module';
import { MailModule } from './common/mail/mail.module';
import { DatabaseModule } from './database/database.module';
import { PageNotFoundExceptionFilter } from './filter/pageNotFound.filter';
import { RequestLoggerInterceptor } from './interceptors/request.interceptor';
import { IpMiddleware } from './middleware/ip.middleware';
import { AnswerAdminModule } from './modules/answer/admin/answer.module';
import { AnswerAppModule } from './modules/answer/app/answer.module';
import { AuthAdminModule } from './modules/auth/admin/auth.module';
import { AuthAppModule } from './modules/auth/app/auth.module';
import { BlogAdminModule } from './modules/blog/admin/blog.module';
import { BlogAppModule } from './modules/blog/app/blog.module';
import { CategoryAdminModule } from './modules/category/admin/category.module';
import { ConsignmentAdminModule } from './modules/consigment/admin/consignment.module';
import { ConsignmentAppModile } from './modules/consigment/app/consigment.module';
import { DoctorAdminModule } from './modules/doctor/admin/doctor.module';
import { DoctorAppModule } from './modules/doctor/app/doctor.module';
import { HomeSaleAdminModule } from './modules/homeSale/admin/homeSale.module';
import { HomeSaleAppModule } from './modules/homeSale/app/homeSale.module';
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
import { ReportAppModule } from './modules/report/app/report.module';
import { ScreenAdminModule } from './modules/screen/admin/screen.module';
import { ScreenAppModule } from './modules/screen/app/screen.module';
import { TeamAdminModule } from './modules/team/admin/team.module';
import { TeamAppModule } from './modules/team/app/team.module';
import { TodoAdminModule } from './modules/todo/admin/todo.module';
import { TodoAppModule } from './modules/todo/app/todo.module';
import { UploadAdminModule } from './modules/upload/admin/upload.module';
import { UserAdminModule } from './modules/user/admin/user.module';
import { UserHomeAdminModule } from './modules/userHome/admin/userHome.module';
import { UserHomeAppModule } from './modules/userHome/app/userHome.module';
import { GuestModule } from './modules/guest/front/guest.module';
import { GuestAdminModule } from './modules/guest/admin/guest.module';
import { CheckoutAppModule } from './modules/checkout/app/checkout.module';

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`, // phân biệt local hay production
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 phút
        limit: 100, // tối đa 100 request / 1 phút
      },
      {
        name: 'sensitive',
        ttl: 60000, // 1 phút
        limit: 5, // tối đa 5 request / 1 phút cho các API nhạy cảm
      }
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
    MailModule,
    MqttModule,
    // commmon
    OptionModule,
    ProvinceModule,
    PhoneCodeModule,
    //app
    AuthAppModule,
    AnswerAppModule,
    DoctorAppModule,
    HomeSaleAppModule,
    ScreenAppModule,
    UserHomeAppModule,
    BlogAppModule,
    TodoAppModule,
    QrAppModule,
    TeamAppModule,
    ConsignmentAppModile,
    ReportAppModule,
    GuestModule,
    CheckoutAppModule,

    //admin
    AuthAdminModule,
    UserAdminModule,
    CategoryAdminModule,
    ObjectAdminModule,
    QuestionAdminModule,
    AnswerAdminModule,
    UploadAdminModule,
    HomeSaleAdminModule,
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
      useValue: new ValidationPipe({
        whitelist: true, // tự động loại bỏ các field không được khai báo trong DTO
        forbidNonWhitelisted: true, // báo lỗi nếu có field không được khai báo trong DTO
        transform: true, // tự động chuyển đổi kiểu dữ liệu dựa trên DTO
      }),
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
      useClass: ThrottlerGuard, // rate limit
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpMiddleware).forRoutes('*'); // bắt ip cho toàn server
  }
}
