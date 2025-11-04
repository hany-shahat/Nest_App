 import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Validate } from "class-validator";
import { Types } from "mongoose";
import { containFields, MongoDBIds } from 'src/common';
import { Type } from 'class-transformer';
import { CreateCategoryDto } from './create-category.dto';
@containFields()
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    
    @Validate(MongoDBIds)
    @IsOptional()
    removeBrands: Types.ObjectId[];
}
 
export class CategoryParamsDTO{
    @IsMongoId()
    categoryId: Types.ObjectId;
}



export class GetAllDTO{
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @IsOptional()
    page: number;
    
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @IsOptional()
    size: number;

    @IsNotEmpty()
    @IsOptional() 
    @IsString()
    search: string;

}