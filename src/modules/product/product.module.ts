import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BrandModel, BrandRepository, CategoryModel, CetagoryRepository, ProductModel, ProductRepository } from 'src/DB';
import { S3Service } from 'src/common';

@Module({
  imports: [
    ProductModel,
    BrandModel,
    CategoryModel,
  ],
  controllers: [
    ProductController,
  ],
  providers: [
    ProductService,
    ProductRepository,
    BrandRepository,
    CetagoryRepository,
    S3Service,
  ],
})
export class ProductModule {}
