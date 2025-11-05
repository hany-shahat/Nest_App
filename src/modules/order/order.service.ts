import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartRepository, CouponRepository, OrderDocument, OrderProduct, OrderRepository, ProductDocument, ProductRepository, UserDocument } from 'src/DB';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import { OrderStatusEnum, PaymentEnum } from 'src/common/enums/order.enum';
import { PaymentService } from 'src/common';
import Stripe from 'stripe';
import type{ Request } from 'express';

@Injectable()
export class OrderService {
  constructor(
  private readonly orderRepository:OrderRepository,
  private readonly productRepository:ProductRepository,
  private readonly couponRepository:CouponRepository,
  private readonly cartRepository:CartRepository,
  private readonly cartService:CartService,
  private readonly paymentService:PaymentService,
){}


  // create order
  async create(
    user:UserDocument,
    createOrderDto: CreateOrderDto,
  ):Promise<OrderDocument> {
    const cart = await this.cartRepository.findOne({
  filter:{createdBy:user._id},
})
if (!cart?.products?.length) {
  throw new NotFoundException("cart is empty")
    }
    let discount = 0;
    let coupon: any;
    if (createOrderDto.coupon) {
      coupon = await this.couponRepository.findOne({
        filter: {
          _id: createOrderDto.coupon,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        },
      });
      if (!coupon) {
        throw new NotFoundException("Fail to find matching coupon")
      };
      if (coupon.duration <= coupon.usedBy.filter((ele) => {
        return ele.toString() == user._id.toString()
      }).length) {
        throw new ConflictException(
          `Sorry you have reached the limit for this coupon can be used only ${coupon.duration} times for please try another vaild coupon`
        )
      };
    };

    let total = 0;
    const products: OrderProduct[] = [];
for (const prodect of cart.products) {
  const cartProduct = await this.productRepository.findOne({
    filter: {
      _id: prodect.productId,
      stock:{$gte:prodect.quantity},
    },
  });
  if (!cartProduct) {
    throw new NotFoundException(`Fail to find matching product ${prodect.productId} or out of stock`)
  };
  const finalPrice = cartProduct.salePrice * prodect.quantity;
  products.push({
    productId: cartProduct._id,
    unitPrice: cartProduct.salePrice,
    quantity: prodect.quantity,
    finalPrice
  });
  total += finalPrice;
    };

    delete createOrderDto.coupon;
    const [order] = await this.orderRepository.create({
      data: [{
        ...createOrderDto,
        coupon: coupon?._id,
        discount,
        orderId: randomUUID().slice(0, 8),
        products,
        total,
        createdBy: user._id,
      }]
    });
    if (!order) {
      throw new BadRequestException("Fail to create this order")
    };
    if (coupon) {
      coupon.usedBy.push(user._id);
      await coupon.save()
    };

    for (const prodect of cart.products) {
     await this.productRepository.updateOne({
        filter: {
          _id: prodect.productId,
          stock: { $gte: prodect.quantity },
       },
       update: {
         $inc:{__v:1,stock:-prodect.quantity}
       }
      });
    };

    await this.cartService.remove(user);

    return order;
  }








  // cancel order
  async cancel(
    orderId:Types.ObjectId,
    user:UserDocument,
  ):Promise<OrderDocument> {

    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: orderId,
        status: { $lt: OrderStatusEnum.Cancel }
      },
      update: {
        status: OrderStatusEnum.Cancel,
        updatedBy:user._id,
      },
    });

   if (!order) {
    throw new NotFoundException("Fail to find matching order")
    }
     for (const prodect of order.products) {
     await this.productRepository.updateOne({
        filter: {
          _id: prodect.productId,
          stock: { $gte: prodect.quantity },
       },
       update: {
         $inc:{__v:1,stock:-prodect.quantity}
       }
      });
    };
    if (order.coupon) {
      await this.couponRepository.findOneAndUpdate({
        filter: {
          _id: order.coupon,
        },
        update: {
          $pull: { usedBy: order.createdBy }
        },
      });
    };

    if (order.payment == PaymentEnum.Card) {
      await this.paymentService.refund(order.intentId)
    }
    
   return order as OrderDocument
  }








  // stripe checkOut
  async checkOut(
orderId:Types.ObjectId,
  user:UserDocument,
  ){
    const order = await this.orderRepository.findOne({
      filter: {
        _id: orderId,
        createdBy: user._id,
        payment: PaymentEnum.Card,
        status:OrderStatusEnum.Pending,
      },
      options: {
        populate:[{path:"products.productId" , select:"name"}]
      }
    })
if (!order) {
  throw new NotFoundException("Fail to find matching order")
    }
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration: "once",
        currency: "egp",
        percent_off: order.discount * 100,
        
      })
      discounts.push({coupon:coupon.id})
    }
    const session = await this.paymentService.checkOutSession({
      customer_email: user.email,
      metadata: { orderId: orderId.toString() },
      discounts,
      line_items: order.products.map(product => {
        return {
          quantity: product.quantity,
          price_data: {
            currency: "egp",
            product_data: {
              name: (product.productId as ProductDocument).name
            },
            unit_amount: product.unitPrice * 100,
          }
        }
      })
    });

    const method = await this.paymentService.createPaymentMethod({
      type: "card",
      card: {
        token: "tok_visa"
      }
    });
    const intent = await this.paymentService.createPaymentIntent({
      amount: order.subtotal * 100,
      currency: "egp",
      payment_method: method.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects:"never",
      }
    })
    order.intentId = intent.id;
    await order.save();
    return session;
  }





  // webhooks
  async webhook(
    req:Request
  ) {
    const event = await this.paymentService.wehook(req);
    const { orderId } = event.data.object.metadata as { orderId: string };
    const order = await this.orderRepository.findOneAndUpdate({
      filter: {
        _id: Types.ObjectId.createFromHexString(orderId),
        status: OrderStatusEnum.Pending,
        payment:PaymentEnum.Card
      },
      update: {
        paidAt: new Date(),
        status:OrderStatusEnum.Placed,
      },
    })
    if (!order) {
      throw new NotFoundException("Fail to find matching order")
    }
    await this.paymentService.confirmPaymentIntent(order.intentId);
    return "";
  }





  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
