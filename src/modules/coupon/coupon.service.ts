import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CouponRepository } from 'src/DB';
import type{ CouponDocument, lean, UserDocument } from 'src/DB';
import { FolderEnum, GetAllDTO, S3Service } from 'src/common';

@Injectable()
export class CouponService {
  constructor(
    private readonly couponRepository:CouponRepository,
    private readonly s3Service:S3Service,
  ){}
  async create(
    createCouponDto: CreateCouponDto,
    file:Express.Multer.File,
    user: UserDocument,
   
  ):Promise<CouponDocument> {
    const checkDuplicated = await this.couponRepository.findOne({
      filter: { name: createCouponDto.name, paranoId: false }
    });

if (checkDuplicated) {
  throw new ConflictException("Duplicated coupon name")
}
    const image = await this.s3Service.uploadFile({ file, path: FolderEnum.Coupon });
    const [coupon] = await this.couponRepository.create({
      data: [{
        ...createCouponDto,
        image,
        createdBy: user._id
      }],
    });
    if (!coupon) {
      await this.s3Service.deleteFile({ Key: image });
      throw new BadRequestException("Fail to create this coupon instance")
    }

    return coupon;
  }



     // Find All product
  async findAll(
    data: GetAllDTO
  ): Promise<
       {
         docsCount?: number,
         limit?: number,
         pages?: number,
         currentPage?: number | undefined,
         result: CouponDocument[] | lean<CouponDocument>[]
       }> {
       const { page, size, search } = data;
       const coupon = await this.couponRepository.paginate({
         filter: {
           ...(search
             ? {
               $or: [
                 { name: { $regex: search, $options: 'i' } },
               ],
             }
             : {}),
         },
         page,
         size,
       })
       return coupon;
     }




  findOne(id: number) {
    return `This action returns a #${id} coupon`;
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    return `This action updates a #${id} coupon`;
  }

  remove(id: number) {
    return `This action removes a #${id} coupon`;
  }
}
