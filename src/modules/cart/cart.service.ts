import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDTO } from './dto/update-cart.dto';
import { CartDocument, CartRepository, ProductRepository, UserDocument } from 'src/DB';
import { Types } from 'mongoose';

@Injectable()
export class CartService {
  constructor(
    private readonly productRepository:ProductRepository,
    private readonly cartRepository:CartRepository,
  ) { }
  

  // create cart
  async create(
    createCartDto: CreateCartDto,
    user:UserDocument,
  ): Promise<{ status: number; cart:CartDocument |any}> {
    const product = await this.productRepository.findOne({
  filter:{_id:createCartDto.productId,stock:{$gte:createCartDto.quantity},},
    },);
if (!product) {
  throw new NotFoundException("Fail to find matiching product instance or product is out of stock")
}
    const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id } })
    if (!cart) {
      const [newCart] = await this.cartRepository.create({
        data: [{createdBy:user._id,products:[{productId:product._id,quantity:createCartDto.quantity}]}]
      })
      if (!newCart) {
        throw new BadRequestException("Fail to create user cart")
      }
      return {status:201 , cart:newCart}
    }
    const checkProductInCart = cart.products.find(product => {
      return product.productId == createCartDto.productId;
    })
    if (checkProductInCart) {
      checkProductInCart.quantity = createCartDto.quantity;
    } else {
      cart.products.push({productId:product._id , quantity:createCartDto.quantity})
    }
    await cart.save()
    return {status:201 , cart};
  }





  // remove Item From Cart
  async removeItemFromCart(
    removeItemsFromCartDTO: RemoveItemsFromCartDTO,
    user:UserDocument,
  ): Promise<CartDocument> {
    const cart = await this.cartRepository.findOneAndUpdate({
      filter: { createdBy: user._id },
      update: {
        $pull: {
          products: {
            productId: {
              $in:
                removeItemsFromCartDTO.productIds.map(product => {
                  return Types.ObjectId.createFromHexString(product as unknown as string)
                })
            }
          }
        }
      },
    }) as CartDocument;
    if (!cart) {
      throw new NotFoundException("Fail to find matching user cart")
    }
  


    return cart;
  }






  // clear Cart
  async remove(
    user:UserDocument,
  ):Promise<string> {
    
    const cart = await this.cartRepository.deleteOne({ filter: { createdBy: user._id } });
  if (!cart.deletedCount) {
    throw new NotFoundException("Fail to find matching user cart")
  }
    return "Done";
  }



  // find One cart
  async findOne(
    user:UserDocument,
  ):Promise<CartDocument> {
    
    const cart = await this.cartRepository.findOne({ filter: { createdBy: user._id },options:{populate:[{path:"products.productId"}]} }) as CartDocument;
  if (!cart) {
    throw new NotFoundException("Fail to find matching user cart")
  }
    return cart;
  }





}
