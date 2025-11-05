import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";


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

    //  @IsOptional()
    // @IsMongoId()
    // category?: string;

    // @IsOptional()
    // @IsMongoId()
    // brand?: string;

}