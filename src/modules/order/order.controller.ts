import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, OrderParamDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { endPoint } from './authorization';
import { Auth, IResponse, RoleEnum, successResponse, User } from 'src/common';
import type{  UserDocument } from 'src/DB';
import { OrderResponse } from './entities/order.entity';
import type{ Request } from 'express';
import { Types } from 'mongoose';
@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}





// create order
  @Auth(endPoint.create)
  @Post()
  async create(
    @User() user:UserDocument,
    @Body() createOrderDto: CreateOrderDto,
  ):Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.create(  user ,createOrderDto);
    return successResponse<OrderResponse>({status:201,data:{order}})
  }

// cancel order
  @Auth([RoleEnum.admin,RoleEnum.superAdmin])
  @Patch(":orderId")
  async cancel(
    @User() user:UserDocument,
    @Param() params:OrderParamDto,
  ):Promise<IResponse<OrderResponse>> {
    const order = await this.orderService.cancel( params.orderId, user );
    return successResponse<OrderResponse>({status:201,data:{order}})
  }






// stripe checkOut
  @Auth(endPoint.create)
  @Post('orderId')
  async checkOut(
    @Param() params:OrderParamDto,
    @User() user:UserDocument,
  ) {
    const session = await this.orderService.checkOut(params.orderId,user);
    return successResponse({data:{session}})
  }



  // webhooks
@Post("webhook")
async webhook(
  @Req() req: Request
) {
  await this.orderService.webhook(req);
  return successResponse()
}






  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
