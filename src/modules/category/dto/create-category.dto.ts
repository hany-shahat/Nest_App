import { IsOptional, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { Types } from "mongoose";
import { ICategory, MongoDBIds } from "src/common";

export class CreateCategoryDto implements Partial<ICategory>{
    @IsString()
    @MaxLength(25)
    @MinLength(2) 
    name: string;

    

    @IsString()
    @MaxLength(5000)
    @MinLength(2) 
    @IsOptional()
    description: string;



    @IsOptional()
    @Validate(MongoDBIds)
    brands: Types.ObjectId[];

 }
