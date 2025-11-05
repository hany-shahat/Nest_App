import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, ParseFilePipe, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { Auth, cloudFileUpload, fileValidation, GetAllDTO, GetAllResponse, IBrand, IResponse, successResponse, User } from 'src/common';
import type{ UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandResponse } from './entities/brand.entity';
import { endPoint } from './brand.authorization';
import { BrandParamsDTO,  UpdateBrandDto } from './dto/update-brand.dto';

@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
  @UseInterceptors
    (FileInterceptor('attachment', cloudFileUpload({ validation: fileValidation.image }),),)
// Create brand
  @Auth(endPoint.create)
  @Post('/create')
  async create(
    
    @User() user: UserDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File,
  
  ):Promise<IResponse<BrandResponse>> {
    
    const brand = await this.brandService.create(createBrandDto ,file , user );

    return successResponse<BrandResponse>({status:201 , data:{brand}})
  }



  // Update brand
@Auth(endPoint.create)
 @Patch(':brandId')
 async update(
   @Param() params: BrandParamsDTO,
   @Body() updateBrandDto: UpdateBrandDto,
   @User() user: UserDocument,

 ):Promise<IResponse<BrandResponse>> {
  const brand = await this.brandService.update(params.brandId, updateBrandDto, user);
  return successResponse<BrandResponse>({data:{brand}})
  }


  // Update brand attachment
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({validation:fileValidation.image})
    )
  )
@Auth(endPoint.create)
 @Patch(':brandId/attachment')
 async updateAttachment(
   @Param() params: BrandParamsDTO,
   @UploadedFile(ParseFilePipe) file:Express.Multer.File,
   @User() user: UserDocument,

 ):Promise<IResponse<BrandResponse>> {
  const brand = await this.brandService.updateAttachment(params.brandId, file, user);
  return successResponse<BrandResponse>({data:{brand}})
  }



  // Soft delete brand
  @Auth(endPoint.create)
 @Delete(':brandId/freeze')
 async freeze(
   @Param() params: BrandParamsDTO,
   @User() user:UserDocument
 ):Promise<IResponse<string>> {
    await this.brandService.freeze(params.brandId, user);
    return successResponse();
  }


  // Hard delete brand
  @Auth(endPoint.create)
 @Delete(':brandId')
 async remove(
   @Param() params: BrandParamsDTO,
   @User() user:UserDocument
 ){
    await this.brandService.remove(params.brandId, user);
    return successResponse();
  }

  // Restore brand
  @Auth(endPoint.create)
 @Patch(':brandId/restore')
 async restore(
   @Param() params: BrandParamsDTO,
   @User() user:UserDocument
 ):Promise<IResponse<BrandResponse>> {
   const brand= await this.brandService.restore(params.brandId, user);
    return successResponse<BrandResponse>({data:{brand}});
  }



// Find All Brand
  @Get()
  async findAll(
    @Query() query:GetAllDTO
   ):Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query);
    return successResponse<GetAllResponse<IBrand>>({data:{result}})
  }


  // Find All Archive Brand
  @Auth(endPoint.create)
  @Get('archive')
  async findAllArchive(
    @Query() query:GetAllDTO
   ):Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAllArchive(query , true);
    return successResponse<GetAllResponse<IBrand>>({data:{result}})
  }


  // FindOne Brand
  @Get(':brandId')
  async findOne(
    @Param() params: BrandParamsDTO
  ) {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse<BrandResponse>({data:{brand}})
  }


  // FindOne Archive Brand
  @Auth(endPoint.create)
  @Get(':brandId/archive')
  async findOneArchive(
    @Param() params: BrandParamsDTO
  ) {
    const brand = await this.brandService.findOne(params.brandId, true);
    return successResponse<BrandResponse>({data:{brand}})
  }

  

 
}
