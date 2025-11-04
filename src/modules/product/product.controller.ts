import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, ParseFilePipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth, cloudFileUpload, fileValidation, IResponse, StorageEnum, successResponse, User } from 'src/common';
import { endPoint } from './product.authorization';
import type{ UserDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';

@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
 @UseInterceptors
    (
       FilesInterceptor('attachments',2,
         cloudFileUpload({
           validation: fileValidation.image,
           storageApproach:StorageEnum.disk,
         }),),)
   
   
   
  //  Create product
 @Auth(endPoint.create)
 @Post()
 async create(
   @UploadedFiles(ParseFilePipe) files:Express.Multer.File[],
   @Body() createProductDto: CreateProductDto,
   @User() user: UserDocument,
   
 ):Promise<IResponse<ProductResponse>> {
   const product = await this.productService.create(createProductDto, files, user);
   return successResponse<ProductResponse>({status:201 , data:{product}})
  }





  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
