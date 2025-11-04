import { IsString, MaxLength, MinLength } from "class-validator";
import { IBrand } from "src/common";

export class CreateBrandDto implements Partial<IBrand>{
    @IsString()
    @MaxLength(25)
    @MinLength(2) 
    name: string;

    @IsString()
    @MaxLength(25)
    @MinLength(2) 
    slogan: string;
 }
