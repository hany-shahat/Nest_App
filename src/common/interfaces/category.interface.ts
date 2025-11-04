import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";

export interface ICategory{
    _id?: Types.ObjectId;

    name: string;
    
    image: string;

    assedFolderId: string;
    
    slug: string;
    
    
    descrption?: string;
    
    brands?: Types.ObjectId[] | IBrand[];
   createdBy: Types.ObjectId |IUser;
   updatedBy: Types.ObjectId |IUser;
    
    updatedAt?: Date;

    createdAt?: Date;
    freezedAt?: Date;

    restordAt?: Date;
}