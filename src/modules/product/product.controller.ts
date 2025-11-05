import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, ParseFilePipe, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductParamDto, UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Auth, cloudFileUpload, fileValidation, GetAllDTO, GetAllResponse, IProduct, IResponse, StorageEnum, successResponse, User } from 'src/common';
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


  // Update product
  @Auth(endPoint.create)
 @Patch(':productId')
 async update(
   @Param() params: ProductParamDto,
   @Body() updateProductDto: UpdateProductDto,
   @User() user: UserDocument,

 ):Promise<IResponse<ProductResponse>>{
    const product = await this.productService.update(params.productId, updateProductDto, user);
    return successResponse<ProductResponse>({data:{product}})
  }



  // Update  attachhment product
  @UseInterceptors
    (
       FilesInterceptor('attachments',2,
         cloudFileUpload({
           validation: fileValidation.image,
           storageApproach:StorageEnum.disk,
         }),),)
  @Auth(endPoint.create)
 @Patch(':productId/attachhment')
 async updateAttachhment(
   @Param() params: ProductParamDto,
   @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
   @User() user: UserDocument,
 @UploadedFiles(ParseFilePipe) files?:Express.Multer.File[],
 ):Promise<IResponse<ProductResponse>>{
    const product = await this.productService.updateAttachhment(params.productId, updateProductAttachmentDto, user, files);
    return successResponse<ProductResponse>({data:{product}})
  }

  
  
   // Soft delete product
      @Auth(endPoint.create)
     @Delete(':productId/freeze')
     async freeze(
       @Param() params: ProductParamDto,
       @User() user:UserDocument
     ):Promise<IResponse<string>> {
        await this.productService.freeze(params.productId, user);
        return successResponse();
      }
    
    
    
    
      // Hard delete product
      @Auth(endPoint.create)
     @Delete(':productId')
     async remove(
       @Param() params: ProductParamDto,
       @User() user:UserDocument
     ){
        await this.productService.remove(params.productId, user);
        return successResponse();
      }
    
    
    
  
      // Restore product
      @Auth(endPoint.create)
     @Patch(':productId/restore')
     async restore(
       @Param() params: ProductParamDto,
       @User() user:UserDocument
     ):Promise<IResponse<ProductResponse>> {
       const product= await this.productService.restore(params.productId, user);
        return successResponse<ProductResponse>({data:{product}});
      }
    
    
    
    // Find All product
      @Get()
      async findAll(
        @Query() query:GetAllDTO
       ):Promise<IResponse<GetAllResponse<IProduct>>> {
        const result = await this.productService.findAll(query);
        return successResponse<GetAllResponse<IProduct>>({data:{result}})
      }
    
    
  
  
      // Find All Archive product
      @Auth(endPoint.create)
      @Get('archive')
      async findAllArchive(
        @Query() query:GetAllDTO
       ):Promise<IResponse<GetAllResponse<IProduct>>> {
        const result = await this.productService.findAllArchive(query , true);
        return successResponse<GetAllResponse<IProduct>>({data:{result}})
      }
    
  
  
    
      // FindOne product
      @Get(':productId')
      async findOne(
        @Param() params: ProductParamDto
      ) {
        const product = await this.productService.findOne(params.productId);
        return successResponse<ProductResponse>({data:{product}})
      }
    
  
  
      
      // FindOne Archive product
      @Auth(endPoint.create)
      @Get(':productId/archive')
      async findOneArchive(
        @Param() params: ProductParamDto
      ) {
        const product = await this.productService.findOne(params.productId, true);
        return successResponse<ProductResponse>({data:{product}})
      }
  
  
  // add whislist
 @Auth(endPoint.create)  
@Patch(":productId/add-to-whislist")  
async addToWhislist(
  @User() user: UserDocument,
  @Param() params:ProductParamDto,
):Promise<IResponse<ProductResponse>> { 
  const product = await this.productService.addToWhislist(params.productId, user)
  return successResponse<ProductResponse>({data:{product}})
} 
  
  
  
  //  remove whislist
   @Auth(endPoint.create)
@Patch(":productId/remove-to-whislist")  
async removeFromWhislist(
  @User() user: UserDocument,
  @Param() params:ProductParamDto,
):Promise<IResponse<string>> { 
  await this.productService.removeFromWhislist(params.productId, user)
  return successResponse({})
} 
  
  /* @Get('search')
  async findByCategoryOrBrand(@Query() query: GetAllDTO) {
    const products = await this.productService.findByCategoryOrBrand(query);
    return {
      statusCode: 200,
      message: 'Success',
      data: products,
    };
  }
 */


  
}
