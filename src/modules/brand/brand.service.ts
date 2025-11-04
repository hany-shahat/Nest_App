import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
 import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandRepository, lean, TokenDocument, UserDocument } from 'src/DB';
import { FolderEnum, S3Service } from 'src/common';
import { GetAllDTO, UpdateBrandDto } from './dto/update-brand.dto';
import {  Types } from 'mongoose';
import { BrandResponse } from './entities/brand.entity';
// import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {

  constructor(
    private readonly brandRepostory: BrandRepository,
    private readonly s3Service: S3Service,
  ) { }
  // Create brand
  async create(createBrandDto: CreateBrandDto, file: Express.Multer.File, user: UserDocument): Promise<BrandDocument> {
    const { name, slogan } = createBrandDto;

    const checkDuplicated = await this.brandRepostory.findOne({
      filter: { name, paranoId: false },
    });

    if (checkDuplicated) {
      throw new ConflictException(checkDuplicated.freezedAt ? "Duplicated with archived brand" : "Brand is Duplicated name")
    }

    const image: string = await this.s3Service.uploadFile({
      file,
      path: `Brand`
    })

    const [brand] = await this.brandRepostory.create({
      data: [{ name, slogan, image, createdBy: user._id }]
    })

    if (!brand) {
      await this.s3Service.deleteFile({ Key: image })
      throw new BadRequestException("File to create this brand resource")
    }

    return brand;
  }

  // Update brand 
  async update(
    brandId: Types.ObjectId,
    updateBrandDto: UpdateBrandDto,
    user: UserDocument
  ): Promise<BrandDocument | lean<BrandDocument>> {
    if (
      updateBrandDto.name &&
      await this.brandRepostory.findOne({ filter: { name: updateBrandDto.name }, },)) {
      throw new ConflictException("Duplicate brand name")
    }
    const brand = await this.brandRepostory.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        ...updateBrandDto,
        updatedBy: user._id,
      }
    })
    if (!brand) {
      throw new NotFoundException("Fail to find matching brand instance")
    }
    return brand;
  }

  // Update brand image
  async updateAttachment(
    brandId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument
  ): Promise<BrandDocument | lean<BrandDocument>> {
    const image = await this.s3Service.uploadFile({
      file,
      path: FolderEnum.Brand,
    })
    const brand = await this.brandRepostory.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        image,
        updatedBy: user._id,
      },
      options: { new: false }
    })
    if (!brand) {
      await this.s3Service.deleteFile({ Key: image });
      throw new NotFoundException("Fail to find matching brand instance");
    }
    await this.s3Service.deleteFile({ Key: brand.image });
    brand.image = image;
    return brand;
  }
  



  // Soft delete brand
  async freeze(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {
   
    const brand = await this.brandRepostory.findOneAndUpdate({
      filter: { _id: brandId },
      update: {
        freezedAt: new Date(),
        $unset: { restordAt: true },
        updatedBy: user._id,
      },
      options: { new: false }
    })
    if (!brand) {
      throw new NotFoundException("Fail to find matching brand instance");
    }
    return "Done";
  }
  
  // Hard delete brand
  async remove(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<string> {
   
    const brand = await this.brandRepostory.findOneAndDelete({
      filter: { _id: brandId, freezedAt: { $exists: true }, paranoId: false },
     
    })
    if (!brand) {
      throw new NotFoundException("Fail to find matching brand instance");
    }
    await this.s3Service.deleteFile({ Key: brand.image })
    return "Done";
  }
  





  // Restore brand
  async restore(
    brandId: Types.ObjectId,
    user: UserDocument
  ): Promise<BrandDocument | lean<BrandDocument>> {
   
    const brand = await this.brandRepostory.findOneAndUpdate({
      filter: { _id: brandId, paranoId: false, freezedAt: { $exists: true } },
      update: {
        restordAt: new Date(),
        $unset: { freezedAt: true },
        updatedBy: user._id,
      },
      options: { new: true }
    })
    console.log('🧩 brand result:', brand);

    if (!brand) {
      throw new NotFoundException("Fail to find matching brand instance");
    }
    return brand;
  }

  
  
  
  
  
  // Find All Brand
  async findAll(data: GetAllDTO): Promise<
    {
      docsCount?: number,
      limit?: number,
      pages?: number,
      currentPage?: number | undefined,
      result: BrandDocument[] | lean<BrandDocument>[]
    }> {
    const { page, size, search } = data;
    const result = await this.brandRepostory.paginate({
      filter: {
        ...(search
          ? {
            $or: [
              { name: { $reges: search, $options: 'i' } },
              { slug: { $reges: search, $options: 'i' } },
              { slogan: { $reges: search, $options: 'i' } },
            ],
          }
          : {}),
      },
      page,
      size,
    })
    return result;
  }



  // Find All Archive Brand
  async findAllArchive(data: GetAllDTO, Archive: boolean = false,): Promise<
    {
      docsCount?: number,
      limit?: number,
      pages?: number,
      currentPage?: number | undefined,
      result: BrandDocument[] | lean<BrandDocument>[]
    }> {
    const { page, size, search } = data;
    const result = await this.brandRepostory.paginate({
      filter: {
        ...(search
          ? {
            $or: [
              { name: { $reges: search, $options: 'i' } },
              { slug: { $reges: search, $options: 'i' } },
              { slogan: { $reges: search, $options: 'i' } },
            ],
          }
          : {}),
        ...(Archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
      },
      page,
      size,
    })
    return result;
  }



  // FindOne And Archive Brand
  async findOne(brandId: Types.ObjectId, archive: boolean = false): Promise<BrandDocument | lean<BrandDocument>> {
    const brand = await this.brandRepostory.findOne({
      filter: {
        _id:brandId,
        ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
 
      },
    });
if (!brand) {
  throw new NotFoundException("Fail to finds matching brand instance");
}
    return brand;
    
    }






  findOnea(id: number) {
    return `This action returns a #${id} brand`;
  }

 

 
}
