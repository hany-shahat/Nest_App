import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { CouponEnum } from "../enums";


export interface ICoupon{
    _id?: Types.ObjectId;

    name: string;
    
    image: string;

    slug: string;

    duration: number;
    discount: number;

    type: CouponEnum;

   createdBy: Types.ObjectId |IUser;
   updatedBy?: Types.ObjectId |IUser;
   usedBy?: Types.ObjectId[] | IUser[];
    
   

    startDate: Date;
    endDate: Date;

    updatedAt?: Date;

    createdAt?: Date;
    freezedAt?: Date;

    restordAt?: Date;
}