import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICategory } from "./category.interface";
import { IBrand } from "./brand.interface";

export interface IProduct{
    _id?: Types.ObjectId;

    name: string;
    
    slug: string;

    assetFolderId: string;
    
    
    description?: string;

    images: string[];

    originalPrice: number;
    discountPercent: number;
    salePrice: number;
    stock: number;
    soldItems: number;

    category: Types.ObjectId | ICategory;
    brand: Types.ObjectId | IBrand;

    
   createdBy: Types.ObjectId |IUser;
   updatedBy: Types.ObjectId |IUser;
    
    updatedAt?: Date;

    createdAt?: Date;
    freezedAt?: Date;

    restordAt?: Date;
}