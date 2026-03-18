import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from 'nestjs-prometheus';
import { HttpMetricsInterceptor } from './interceptors/metrics.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CornModule } from './common/corn/corn.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { LoggerModule } from './common/logger/logger.module';
import { MqttModule } from './common/mqtt/mqtt.module';
import { SocketModule } from './common/socket/socket.module';
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

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`, // phân biệt local hay production
    }),
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
    ConsignmentAdminModule
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IpMiddleware).forRoutes('*'); // bắt ip cho toàn server
  }
}
