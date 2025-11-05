import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsMongoId, IsOptional } from "class-validator";
import { Types } from "mongoose";
import { containFields } from "src/common";
import { CreateProductDto } from "./create-product.dto";



@containFields()
export class UpdateProductDto extends PartialType(CreateProductDto){ 

}
export class UpdateProductAttachmentDto { 
    @IsArray()
    @IsOptional()
    removedAttachments?: string[];
}
 

export class ProductParamDto{

    @IsMongoId()
    productId:Types.ObjectId
}