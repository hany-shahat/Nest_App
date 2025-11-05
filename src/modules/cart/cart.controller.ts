import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDTO, UpdateCartDto } from './dto/update-cart.dto';
import { Auth, IResponse,  successResponse, User } from 'src/common';
import type{ UserDocument } from 'src/DB';
import { CartResponse } from './entities/cart.entity';
import { RoleEnum } from 'src/common';
 
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}


  // create cart
  @Auth([RoleEnum.user])
  @Post()
  async create(
    @Body() createCartDto: CreateCartDto,
    @User()   user:UserDocument,
  ):Promise<IResponse<CartResponse>> {
    const { cart, status } = await this.cartService.create(createCartDto, user);
    return successResponse<CartResponse>({status,data:{cart}})
  }



  // remove Item From Cart
  @Auth([RoleEnum.user])
  @Patch('remove-from-cart')
  async removeItemFromCart(
    @User() user: UserDocument,
    @Body() removeItemsFromCartDTO: RemoveItemsFromCartDTO,
  ):Promise<IResponse<CartResponse>> {
    const cart= await this.cartService.removeItemFromCart(removeItemsFromCartDTO, user);
    return successResponse<CartResponse>({data:{cart}})
  }



  // clear Cart
  @Auth([RoleEnum.user])
  @Delete()
  async remove(
    @User() user: UserDocument,
  ):Promise<IResponse<string>> {
    const cart= await this.cartService.remove(user);
    return successResponse()
  }



  // find One cart
  @Auth([RoleEnum.user])
  @Get()
  async findOne(
    @User() user: UserDocument,
  ):Promise<IResponse<CartResponse>> {
    const cart= await this.cartService.findOne(user);
    return successResponse<CartResponse>({data:{cart}})
  }




  

  
}
