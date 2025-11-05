import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Auth, cloudFileUpload, fileValidation, GetAllDTO, GetAllResponse, ICoupon, IResponse, successResponse, User } from 'src/common';
import { endPoint } from './authorization';
import { FileInterceptor } from '@nestjs/platform-express';
import type{ CouponDocument, UserDocument } from 'src/DB';
import { CouponResponse } from './entities/coupon.entity';
@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // create coupon
  @UseInterceptors(FileInterceptor("attachment" ,cloudFileUpload({validation:fileValidation.image})))
  @Auth(endPoint.create)
  @Post()
  async create(
    @User() user: UserDocument,
    @UploadedFile(ParseFilePipe) file:Express.Multer.File,
    @Body() createCouponDto: CreateCouponDto,
  
  ):Promise<IResponse<CouponResponse>> {

    const coupon = await this.couponService.create(createCouponDto, file, user);
    return successResponse<CouponResponse>({status:201,data:{coupon}})
  }

 
  // Find All coupon
  @Get()
  async findAll(
  @Query() query:GetAllDTO
  ):Promise<IResponse<GetAllResponse<ICoupon>>> {
          const result = await this.couponService.findAll(query);
          return successResponse<GetAllResponse<ICoupon>>({data:{result}})
        }
  



  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }
}
