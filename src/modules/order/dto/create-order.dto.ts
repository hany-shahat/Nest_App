import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Types } from "mongoose";
import { IOrder } from "src/common";
import { PaymentEnum } from "src/common/enums/order.enum";

export class OrderParamDto{
    @IsMongoId()
    orderId: Types.ObjectId;
}

export class CreateOrderDto implements Partial<IOrder> {
    @IsMongoId()
    @IsOptional()
    coupon?: Types.ObjectId;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    note?: string;

    @Matches(/^(022|\+2)?01[0125][0-9]{8}$/)
    phone: string;

    @IsEnum(PaymentEnum)
    payment: PaymentEnum;

}
