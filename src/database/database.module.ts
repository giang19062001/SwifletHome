import { Global, Module } from '@nestjs/common';
import { databaseProviders } from './database.provider';

@Global() // Dùng cho tất cả modules
@Module({
  providers: [databaseProviders],
  exports: [databaseProviders],
})
export class DatabaseModule {}
