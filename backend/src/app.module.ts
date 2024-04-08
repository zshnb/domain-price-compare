import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DomainModule } from './domain/domain.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DomainModule,
    ConfigModule.forRoot({
      envFilePath: [`config/.env.${process.env.NODE_ENV}`],
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
