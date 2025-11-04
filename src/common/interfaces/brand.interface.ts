import { Types } from "mongoose";
import { IUser } from "./user.interface";

export interface IBrand{
    _id?: Types.ObjectId;

    name: string;
    
    image: string;
    
    slug: string;
    
    
    slogan: string;
    
   createdBy: Types.ObjectId |IUser;
   updatedBy: Types.ObjectId |IUser;
    
    updatedAt?: Date;

    createdAt?: Date;
    freezedAt?: Date;

    restordAt?: Date;
}