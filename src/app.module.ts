import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SheredAuthenticationModule } from './common';




@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: resolve("./config/.env.development") }),
    MongooseModule.forRoot(process.env.DB_URI as string, { serverSelectionTimeoutMS: 30000 }),
    SheredAuthenticationModule,
    AuthenticationModule,
    UserModule,
    CategoryModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
