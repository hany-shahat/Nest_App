import { Injectable } from "@nestjs/common";
import { DatabaseRepository } from "./database.repository";
import { CouponDocument as TDocument, Coupon} from "../model";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class CouponRepository extends DatabaseRepository<Coupon>{
    constructor(@InjectModel(Coupon.name) protected override readonly model:Model<TDocument> ) {
    super(model)
}
}