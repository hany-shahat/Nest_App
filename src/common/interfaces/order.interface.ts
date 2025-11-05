import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { ICoupon } from "./coupon.interface";
import { IProduct } from "./product.interface";
import { OrderStatusEnum, PaymentEnum } from "../enums/order.enum";


export interface IOrderProduct{
    _id?: Types.ObjectId;
    productId:Types.ObjectId|IProduct
    quantity: number;
    unitPrice: number;
    finalPrice: number;
    updatedAt?: Date;
    createdAt?: Date;
}
export interface IOrder{
    _id?: Types.ObjectId;
    orderId: string;

    address: string;
    
    phone: string;

    note?: string;
    
    intentId?: string;

    cancelReason?: string;

    status: OrderStatusEnum;

    payment: PaymentEnum;

    coupon?: Types.ObjectId | ICoupon;

    discount?: number;

    total: number;

    subtotal: number;

    paidAt?: Date;

    paymentIntent ?: string;
    
    products: IOrderProduct[];

    updatedAt?: Date;
    createdAt?: Date;

    freezedAt?: Date;
    restordAt?: Date;

   createdBy: Types.ObjectId |IUser;
   updatedBy?: Types.ObjectId |IUser;
}