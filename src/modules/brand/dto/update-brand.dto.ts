 import { PartialType } from '@nestjs/mapped-types';
 import { CreateBrandDto } from './create-brand.dto';

import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Types } from "mongoose";
import { containFields } from 'src/common';
import { Type } from 'class-transformer';
@containFields()
 export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
export class BrandParamsDTO{
    @IsMongoId()
    brandId: Types.ObjectId;
}


