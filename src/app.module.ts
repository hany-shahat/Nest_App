import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { UserModule } from './modules/user/user.module';
import { CategoryModule } from './modules/category/category.module';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Service, SheredAuthenticationModule } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { ProductModule } from './modules/product/product.module';




@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: resolve("./config/.env.development") }),
    MongooseModule.forRoot(process.env.DB_URI as string, { serverSelectionTimeoutMS: 30000 }),
    SheredAuthenticationModule,
    AuthenticationModule,
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    S3Service,
  ],
})
export class AppModule {}
