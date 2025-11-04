import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BrandRepository, CetagoryRepository, ProductDocument, ProductRepository, UserDocument } from 'src/DB';
import { FolderEnum, S3Service } from 'src/common';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService {

  constructor(
  private readonly productRepository:ProductRepository,
  private readonly brandRepository:BrandRepository,
  private readonly categoryRepository:CetagoryRepository,
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





  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
