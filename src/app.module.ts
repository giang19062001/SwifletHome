import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { QuestionAdminModule } from './modules/question/admin/question.module';
import { AnswerAdminModule } from './modules/answer/admin/answer.module';
import { UploadAdminModule } from './modules/upload/admin/upload.module';
import { AuthAdminModule } from './modules/auth/admin/auth.module';
import { AnswerAppModule } from './modules/answer/app/answer.module';
import { HomeSaleAdminModule } from './modules/homeSale/admin/homeSale.module';
import { HomeSaleAppModule } from './modules/homeSale/app/homeSale.module';
import { BlogAdminModule } from './modules/blog/admin/blog.module';
import { OptionModule } from './modules/options/option.module';
import { DoctorAppModule } from './modules/doctor/app/doctor.module';
import { DoctorAdminModule } from './modules/doctor/admin/doctor.module';
import { LoggerModule } from './common/logger/logger.module';
import { AuthAppModule } from './modules/auth/app/auth.module';
import { UserAdminModule } from './modules/user/admin/user.module';
import { CategoryAdminModule } from './modules/category/admin/category.module';
import { ScreenAppModule } from './modules/screen/app/screen.module';
import { ObjectAdminModule } from './modules/object/admin/object.module';
import { ScreenAdminModule } from './modules/screen/admin/screen.module';
import { InfoAdminModule } from './modules/info/admin/info.module';
import { PackageAdminModule } from './modules/package/admin/package.module';
import { IpMiddleware } from './middleware/ip.middleware';
import { CornModule } from './common/corn/corn.module';
import { ProvinceModule } from './modules/province/province.module';
import { UserHomeAppModule } from './modules/userHome/app/userHome.module';
import { SocketModule } from './common/socket/socket.module';
import { UserHomeAdminModule } from './modules/userHome/admin/userHome.module';
import { BlogAppModule } from './modules/blog/app/blog.module';
import { TodoAppModule } from './modules/todo/app/todo.module';
import { TodoAdminModule } from './modules/todo/admin/todo.module';
import { FirebaseModule } from './common/firebase/firebase.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { RequestLoggerInterceptor } from './interceptors/request.interceptor';
import { PageNotFoundExceptionFilter } from './filter/pageNotFound.filter';
import { NotificationAdminModule } from './modules/notification/admin/notification.module';
import { MqttModule } from './common/mqtt/mqtt.module';
import { QrAppModule } from './modules/qr/app/qr.module';
import { QrAdminModule } from './modules/qr/admin/qr.module';

@Module({
  imports: [
    // global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CornModule,
    DatabaseModule,
    LoggerModule,
    SocketModule,
    FirebaseModule,
    MqttModule,
    // commmon
    OptionModule,
    ProvinceModule,

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
    QrAdminModule

  ],
  controllers: [AppController],
  providers: [
    AppService,
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
