import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryParamsDTO, GetAllDTO, UpdateCategoryDto } from './dto/update-category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Auth, cloudFileUpload, fileValidation, IResponse, successResponse, User } from 'src/common';
import { endPoint } from './category.authorization';
import type{ UserDocument } from 'src/DB';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CategoryResponse, GetAllResponse } from './entities/category.entity';


@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @UseInterceptors
    (
       FileInterceptor('attachment',
       cloudFileUpload({ validation: fileValidation.image }),),)
   
    
    
   
  // Create brand
    @Auth(endPoint.create)
    @Post()
    async create(
      
      @User() user: UserDocument,
      @Body() createCategoryDto: CreateCategoryDto,
      @UploadedFile(ParseFilePipe) file:Express.Multer.File,
    
    ):Promise<IResponse<CategoryResponse>> {
      
      const category = await this.categoryService.create(createCategoryDto ,file , user );
  
      return successResponse<CategoryResponse>({status:201 , data:{category}})
    }
  
  
  
  
  
    // Update category
  @Auth(endPoint.create)
   @Patch(':categoryId')
   async update(
     @Param() params: CategoryParamsDTO,
     @Body() updateCategoryDto: UpdateCategoryDto,
     @User() user: UserDocument,
  
   ):Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.update(params.categoryId, updateCategoryDto, user);
    return successResponse<CategoryResponse>({data:{category}})
    }
  
  
  
  
    // Update category attachment
    @UseInterceptors(
      FileInterceptor(
        'attachment',
        cloudFileUpload({validation:fileValidation.image})
      )
    )
  @Auth(endPoint.create)
   @Patch(':categoryId/attachment')
   async updateAttachment(
     @Param() params: CategoryParamsDTO,
     @UploadedFile(ParseFilePipe) file:Express.Multer.File,
     @User() user: UserDocument,
  
   ):Promise<IResponse<CategoryResponse>> {
    const category = await this.categoryService.updateAttachment(params.categoryId, file, user);
    return successResponse<CategoryResponse>({data:{category}})
    }
  
  
  
  
    // Soft delete brand
    @Auth(endPoint.create)
   @Delete(':categoryId/freeze')
   async freeze(
     @Param() params: CategoryParamsDTO,
     @User() user:UserDocument
   ):Promise<IResponse<string>> {
      await this.categoryService.freeze(params.categoryId, user);
      return successResponse();
    }
  
  
  
  
    // Hard delete Category
    @Auth(endPoint.create)
   @Delete(':categoryId')
   async remove(
     @Param() params: CategoryParamsDTO,
     @User() user:UserDocument
   ){
      await this.categoryService.remove(params.categoryId, user);
      return successResponse();
    }
  
  
  
    // Restore category
    @Auth(endPoint.create)
   @Patch(':categoryId/restore')
   async restore(
     @Param() params: CategoryParamsDTO,
     @User() user:UserDocument
   ):Promise<IResponse<CategoryResponse>> {
     const category= await this.categoryService.restore(params.categoryId, user);
      return successResponse<CategoryResponse>({data:{category}});
    }
  
  
  
  // Find All category
    @Get()
    async findAll(
      @Query() query:GetAllDTO
     ):Promise<IResponse<GetAllResponse>> {
      const result = await this.categoryService.findAll(query);
      return successResponse<GetAllResponse>({data:{result}})
    }
  
  
    // Find All Archive category
    @Auth(endPoint.create)
    @Get('archive')
    async findAllArchive(
      @Query() query:GetAllDTO
     ):Promise<IResponse<GetAllResponse>> {
      const result = await this.categoryService.findAllArchive(query , true);
      return successResponse<GetAllResponse>({data:{result}})
    }
  
  
    // FindOne category
    @Get(':categoryId')
    async findOne(
      @Param() params: CategoryParamsDTO
    ) {
      const category = await this.categoryService.findOne(params.categoryId);
      return successResponse<CategoryResponse>({data:{category}})
    }
  
    
    // FindOne Archive category
    @Auth(endPoint.create)
    @Get(':categoryId/archive')
    async findOneArchive(
      @Param() params: CategoryParamsDTO
    ) {
      const category = await this.categoryService.findOne(params.categoryId, true);
      return successResponse<CategoryResponse>({data:{category}})
    }
}
