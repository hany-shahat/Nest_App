import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { BrandRepository, CategoryDocument, CetagoryRepository, lean, ProductDocument, ProductRepository, UserDocument, UserRepository } from 'src/DB';
import { FolderEnum, GetAllDTO, S3Service } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

@Injectable()
export class ProductService {

  constructor(
  private readonly productRepository:ProductRepository,
  private readonly brandRepository:BrandRepository,
  private readonly categoryRepository:CetagoryRepository,
  private readonly userRepository:UserRepository,
  private readonly s3Service:S3Service,
){}

  // Create product
  async create(
    createProductDto: CreateProductDto,
    files: Express.Multer.File[],
    user:UserDocument,
  ):Promise<ProductDocument> {
const{name,description,discountPercent,originalPrice,stock}=createProductDto
    const category = await this.categoryRepository.findOne({ filter: { _id: createProductDto.category }, });
if (!category) {
  throw new NotFoundException("Fail to find matching categry instance")
    };
    const brand = await this.brandRepository.findOne({ filter: { _id: createProductDto.brand }, });
if (!brand) {
  throw new NotFoundException("Fail to find matching brand instance")
    };

    let assetFolderId = randomUUID();
    const images = await this.s3Service.uploadFiles({
      files,
      path: `${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}/${assetFolderId}`,
    });

    const [product] = await this.productRepository.create({
      data: [{
        category: category._id,
        brand: brand._id,
        name,
        description,
        discountPercent,
        originalPrice,
        salePrice:originalPrice - originalPrice * (discountPercent / 100),
        stock,
        assetFolderId,
        images,
        createdBy: user._id,
      },
      ],
    });
if (!product) {
  throw new BadRequestException("Fail to create this product instance")
}

    return product;
  }




// Update product
 async update(
    productId: Types.ObjectId,
    updateProductDto: UpdateProductDto,
    user:UserDocument,
 ):Promise<ProductDocument> {
   
   const product = await this.productRepository.findOne({
     filter: {_id:productId},
   });
   if (!product) {
    throw new NotFoundException("Fail to find matching product instance")
   }
   

   if (updateProductDto.category) {
     const category = await this.categoryRepository.findOne({
       filter: { _id: updateProductDto.category },
     });
     if (!category)
     {
  throw new NotFoundException("Fail to find matching categry instance")
    };
   }
  
   
  if (updateProductDto.brand) {
    const brand = await this.brandRepository.findOne({
      filter: { _id: updateProductDto.brand },
    });
    if (!brand)
    {
  throw new NotFoundException("Fail to find matching brand instance")
    };
  }

   
  let salePrice = product.salePrice;
if (updateProductDto.originalPrice || updateProductDto.discountPercent) {
  const originalPrice = updateProductDto.originalPrice ?? product.originalPrice;
  const discountPercent = updateProductDto.discountPercent ?? product.discountPercent;

  const finalPrice = originalPrice - (originalPrice * (discountPercent / 100));
  salePrice = finalPrice > 0 ? finalPrice : 1;
}

   const updateProduct = await this.productRepository.findOneAndUpdate({
     filter: { _id: productId },
     update: {
       ...updateProductDto,
       salePrice,
       updatedBy:user._id,
     },
   }) as ProductDocument;

if (!updateProduct) {
  throw new BadRequestException("Fail to update this product instance")
}

    return updateProduct;



  }




// Update attachment product
 async updateAttachhment(
    productId: Types.ObjectId,
    updateProductAttachmentDto: UpdateProductAttachmentDto,
   user: UserDocument,
    files?:Express.Multer.File[],
 ):Promise<ProductDocument> {
   
   const product = await this.productRepository.findOne({
     filter: { _id: productId },
     options:{populate:[{path:"category"}]}
   });
   if (!product) {
    throw new NotFoundException("Fail to find matching product instance")
   }
   

   let attachhments: string[] = [];
   if (files?.length) {
     attachhments = await this.s3Service.uploadFiles({
       files,
       path: `${FolderEnum.Category}/${(product.category as unknown as CategoryDocument).assedFolderId}/${FolderEnum.Product}/${product.assetFolderId}`
     });
   };
  
  
const removedAttachments=[...new Set(updateProductAttachmentDto.removedAttachments ??[])]
   const updateAttachmentProduct = await this.productRepository.findOneAndUpdate({
     filter: { _id: productId },
     update: [{
       $set: {
         updatedBy: user._id,
         images: {
           $setUnion: [
             {
               $setDifference: [
                 "$images",
                 removedAttachments
               ]
             },
             attachhments
           ]
         },
       },
     },
     ],
   }) as ProductDocument;

   if (!updateAttachmentProduct) {
     await this.s3Service.deleteFiles({ urls: attachhments });
  throw new BadRequestException("Fail to updateAttachment this product instance")
}
await this.s3Service.deleteFiles({ urls: removedAttachments });
    return updateAttachmentProduct;



  }





  
     // Soft delete product
     async freeze(
       productId: Types.ObjectId,
       user: UserDocument
     ): Promise<string> {
      
       const product = await this.productRepository.findOneAndUpdate({
         filter: { _id: productId },
         update: {
           freezedAt: new Date(),
           $unset: { restordAt: true },
           updatedBy: user._id,
         },
         options: { new: false }
       })
       if (!product) {
         throw new NotFoundException("Fail to find matching category instance");
       }
       return "Done";
     }
     
    
    
     // Hard delete product
     async remove(
       productId: Types.ObjectId,
       user: UserDocument
     ): Promise<string> {
      
       const product = await this.productRepository.findOneAndDelete({
         filter: { _id: productId, freezedAt: { $exists: true }, paranoId: false },
        
       })
       if (!product) {
         throw new NotFoundException("Fail to find matching product instance");
       }
      await this.s3Service.deleteFiles({ urls: product.images });
       return "Done";
     }
     
   
   
   
   
   
     // Restore product
     async restore(
       productId: Types.ObjectId,
       user: UserDocument
     ): Promise<ProductDocument | lean<ProductDocument>> {
      
       const product = await this.productRepository.findOneAndUpdate({
         filter: { _id: productId, paranoId: false, freezedAt: { $exists: true } },
         update: {
           restordAt: new Date(),
           $unset: { freezedAt: true },
           updatedBy: user._id,
         },
         options: { new: true }
       })
       console.log('🧩 brand result:', product);
   
       if (!product) {
         throw new NotFoundException("Fail to find matching product instance");
       }
       return product;
     }
   
     
     
     
     
     
     // Find All product
     async findAll(data: GetAllDTO): Promise<
       {
         docsCount?: number,
         limit?: number,
         pages?: number,
         currentPage?: number | undefined,
         result: ProductDocument[] | lean<ProductDocument>[]
       }> {
       const { page, size, search } = data;
       const product = await this.productRepository.paginate({
         filter: {
           ...(search
             ? {
               $or: [
                 { name: { $regex: search, $options: 'i' } },
                 { slug: { $regex: search, $options: 'i' } },
                 { description: { $regex: search, $options: 'i' } },
               ],
             }
             : {}),
         },
         page,
         size,
       })
       return product;
     }
   
   
   
     // Find All Archive product
     async findAllArchive(data: GetAllDTO, Archive: boolean = false,): Promise<
       {
         docsCount?: number,
         limit?: number,
         pages?: number,
         currentPage?: number | undefined,
         result: ProductDocument[] | lean<ProductDocument>[]
       }> {
       const { page, size, search } = data;
       const product= await this.productRepository.paginate({
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
       return product;
     }
   
   
   
     // FindOne And Archive product
     async findOne(productId: Types.ObjectId, archive: boolean = false): Promise<ProductDocument | lean<ProductDocument>> {
       const product = await this.productRepository.findOne({
         filter: {
           _id:productId,
           ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
    
         },
       });
   if (!product) {
     throw new NotFoundException("Fail to finds matching brand instance");
   }
       return product;
       
  }
  




     // add whislist
  async addToWhislist(
    productId: Types.ObjectId,
    user:UserDocument,
  ): Promise<ProductDocument | lean<ProductDocument>> {
       const product = await this.productRepository.findOne({
         filter: {
           _id:productId,
         },
       });
   if (!product) {
     throw new NotFoundException("Fail to finds matching  prodect instance");
    }
    await this.userRepository.updateOne({
      filter: { _id: user._id },
      update:{$addToSet:{ whislist:product._id}}
    })
       return product;
       
  }
  


     // remove whislist
  async removeFromWhislist(
    productId: Types.ObjectId,
    user:UserDocument,
  ): Promise<string> {
       const product = await this.productRepository.findOne({
         filter: {
           _id:productId,
         },
       });
   if (!product) {
     throw new NotFoundException("Fail to finds matching  prodect instance");
    }
    await this.userRepository.updateOne({
      filter: { _id: user._id },
      update:{$pull:{ whislist:Types.ObjectId.createFromHexString(productId as unknown as string )}}
    })
       return "done";
       
       }
   

  
  
  
// findBy Category Or Brand
/* 
  async findByCategoryOrBrand(query: GetAllDTO): Promise<{
    docsCount?: number;
    limit?: number;
    pages?: number;
    currentPage?: number;
    result: ProductDocument[] | any[];
  }> {
    const { category, brand, page = 1, size = 10, search } = query;
    const filter: any = {};
    if (category) {
      if (!Types.ObjectId.isValid(category)) {
        throw new BadRequestException('Invalid category id');
      }
      filter.category = new Types.ObjectId(category);
    }

    if (brand) {
      if (!Types.ObjectId.isValid(brand)) {
        throw new BadRequestException('Invalid brand id');
      }
      filter.brand = new Types.ObjectId(brand);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await this.productRepository.paginate({
      filter,
      page,
      size,
      
    });

    return products;
  } */







}
