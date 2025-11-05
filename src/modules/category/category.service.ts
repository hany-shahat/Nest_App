import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import {  UpdateCategoryDto } from './dto/update-category.dto';
import { BrandRepository, CategoryDocument, CetagoryRepository, lean, UserDocument } from 'src/DB';
import { FolderEnum, GetAllDTO, S3Service } from 'src/common';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
  
    constructor(
      private readonly brandRepostory: BrandRepository,
      private readonly s3Service: S3Service,
      private readonly categoryRepository:CetagoryRepository,
  ) { }
  


   // Create category
  async create
    (
      createCategoryDto: CreateCategoryDto,
      file: Express.Multer.File,
      user: UserDocument
   ): Promise<CategoryDocument> {
     const { name } = createCategoryDto;
 
     const checkDuplicated = await this.categoryRepository.findOne({
       filter: { name, paranoId: false },
     });
 
     if (checkDuplicated) {
       throw new ConflictException(checkDuplicated.freezedAt ?
         "Duplicated with archived Category" :
         "Category is Duplicated name",
       );
    }
    
    const brands: Types.ObjectId[] = [
      ...new Set(createCategoryDto.brands || [])
    ];
    if (brands&&(await this.brandRepostory.find({filter:{_id:{$in:brands}}})).length != brands.length) {
      throw new NotFoundException("some of mentioned brands are not exists")
    };
    
    let assedFolderId: string = randomUUID();
     const image: string = await this.s3Service.uploadFile({
       file,
       path: `${FolderEnum.Category}/${assedFolderId}`
     })
 
    const [Category] = await this.categoryRepository.create({
      data: [{
        ...createCategoryDto,
        image,
        assedFolderId,
        createdBy: user._id,
        brands: brands.map((brand) => {
          return Types.ObjectId.createFromHexString(brand as unknown as string);
        }),
      }],
    });
 
     if (!Category) {
       await this.s3Service.deleteFile({ Key: image })
       throw new BadRequestException("File to create this Category resource")
     }
 
     return Category;
   }
 
  
  
  
  
   // Update Category 
   async update(
     CategoryId: Types.ObjectId,
     updateCategoryDto: UpdateCategoryDto,
     user: UserDocument
   ): Promise<CategoryDocument | lean<CategoryDocument>> {
     if (
       updateCategoryDto.name &&
       await this.categoryRepository.findOne({ filter: { name: updateCategoryDto.name }, },)) {
       throw new ConflictException("Duplicate Category name")
     }

      const brands: Types.ObjectId[] = [
      ...new Set(updateCategoryDto.brands || [])
    ];
    if (brands&&(await this.brandRepostory.find({filter:{_id:{$in:brands}}})).length != brands.length) {
      throw new NotFoundException("some of mentioned brands are not exists")
     };
     const Category = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: CategoryId },
       update: [
         {
           $set: {
             ...updateCategoryDto,
             updatedBy: user._id,
             brands: {
               $setUnion: [
                 {
                   $setDifference: [
                     "$brands",
                     (updateCategoryDto.removeBrands || []).map((brand) => {
                       return Types.ObjectId.createFromHexString(brand as unknown as string)
                     }),
                   ],
                 },
               
                 brands.map((brand) => {
                   return Types.ObjectId.createFromHexString(brand as unknown as string);
                 }),
               ],
             },
           },
         }
       ],
});
     if (!Category) {
       throw new NotFoundException("Fail to find matching Category instance")
     }
     return Category;
   }
 
  
  
  
   // Update Category image
   async updateAttachment(
     CategoryId: Types.ObjectId,
     file: Express.Multer.File,
     user: UserDocument
   ): Promise<CategoryDocument | lean<CategoryDocument>> {
      const Category = await this.categoryRepository.findOne({
       filter: { _id: CategoryId },
     })
     if (!Category) {
       throw new NotFoundException("Fail to find matching Category instance");
     }
     const image = await this.s3Service.uploadFile({
       file,
       path:`${ FolderEnum.Category}/${Category.assedFolderId}`,
     })
     const updatedCategory = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: CategoryId },
       update: {
         image,
         updatedBy: user._id,
       },
       
     })
     if (! updatedCategory) {
       await this.s3Service.deleteFile({ Key: image });
       throw new NotFoundException("Fail to find matching Category instance");
     }
     await this.s3Service.deleteFile({ Key: Category.image });
     return updatedCategory;
   }
   
 
 
 
   // Soft delete Category
   async freeze(
     categoryId: Types.ObjectId,
     user: UserDocument
   ): Promise<string> {
    
     const brand = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: categoryId },
       update: {
         freezedAt: new Date(),
         $unset: { restordAt: true },
         updatedBy: user._id,
       },
       options: { new: false }
     })
     if (!brand) {
       throw new NotFoundException("Fail to find matching category instance");
     }
     return "Done";
   }
   
  
  
   // Hard delete category
   async remove(
     categoryId: Types.ObjectId,
     user: UserDocument
   ): Promise<string> {
    
     const brand = await this.categoryRepository.findOneAndDelete({
       filter: { _id: categoryId, freezedAt: { $exists: true }, paranoId: false },
      
     })
     if (!brand) {
       throw new NotFoundException("Fail to find matching category instance");
     }
     await this.s3Service.deleteFile({ Key: brand.image })
     return "Done";
   }
   
 
 
 
 
 
   // Restore category
   async restore(
     categoryId: Types.ObjectId,
     user: UserDocument
   ): Promise<CategoryDocument | lean<CategoryDocument>> {
    
     const category = await this.categoryRepository.findOneAndUpdate({
       filter: { _id: categoryId, paranoId: false, freezedAt: { $exists: true } },
       update: {
         restordAt: new Date(),
         $unset: { freezedAt: true },
         updatedBy: user._id,
       },
       options: { new: true }
     })
     console.log('🧩 brand result:', category);
 
     if (!category) {
       throw new NotFoundException("Fail to find matching category instance");
     }
     return category;
   }
 
   
   
   
   
   
   // Find All category
   async findAll(data: GetAllDTO): Promise<
     {
       docsCount?: number,
       limit?: number,
       pages?: number,
       currentPage?: number | undefined,
       result: CategoryDocument[] | lean<CategoryDocument>[]
     }> {
     const { page, size, search } = data;
     const category = await this.categoryRepository.paginate({
       filter: {
         ...(search
           ? {
             $or: [
               { name: { $$regex: search, $options: 'i' } },
               { slug: { $$regex: search, $options: 'i' } },
               { descrption: { $reges: search, $options: 'i' } },
             ],
           }
           : {}),
       },
       page,
       size,
     })
     return category;
   }
 
 
 
   // Find All Archive category
   async findAllArchive(data: GetAllDTO, Archive: boolean = false,): Promise<
     {
       docsCount?: number,
       limit?: number,
       pages?: number,
       currentPage?: number | undefined,
       result: CategoryDocument[] | lean<CategoryDocument>[]
     }> {
     const { page, size, search } = data;
     const category= await this.categoryRepository.paginate({
       filter: {
         ...(search
           ? {
             $or: [
               { name: { $reges: search, $options: 'i' } },
               { slug: { $reges: search, $options: 'i' } },
               { descrption: { $reges: search, $options: 'i' } },
             ],
           }
           : {}),
         ...(Archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
       },
       page,
       size,
     })
     return category;
   }
 
 
 
   // FindOne And Archive category
   async findOne(categoryId: Types.ObjectId, archive: boolean = false): Promise<CategoryDocument | lean<CategoryDocument>> {
     const category = await this.categoryRepository.findOne({
       filter: {
         _id:categoryId,
         ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
  
       },
     });
 if (!category) {
   throw new NotFoundException("Fail to finds matching brand instance");
 }
     return category;
     
     }
 
 
 
 
 
 
   findOnea(id: number) {
     return `This action returns a #${id} brand`;
   }
 
}
