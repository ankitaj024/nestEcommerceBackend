import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req , Header } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Request, Response } from 'express';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  //Create Order API
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() request:Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = ( request as any ).user.id;
    return this.orderService.create(userId,createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/razorpay')
  createUsingRazorpay(@Req() request:Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = ( request as any ).user.id;
    return this.orderService.createUsingRazorpay(userId,createOrderDto);
  }

  //getOrders API
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() request:Request) {
    const userId = ( request as any ).user.id;
    return this.orderService.findOrderOfUser(userId)
  }

  //webhook for razorpay
  @Post('/razorpay/webhook')
  orderCreateByRazorpayLink(@Req() req){
    return this.orderService.orderCreateByPaymentLinkResponse(req)
  }


  @UseGuards(JwtAuthGuard)
  @Post('/paypal')
  createUsingPaypal(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const userId = (req as any).user.id;
    return this.orderService.createUsingPaypal(userId, dto);
  }
  
  @Post('/paypal/webhook')
  @Header('Content-Type', 'application/json')
  async handlePaypalWebhook(@Req() req: Request, @Res() res: Response) {
    return this.orderService.handlePaypalWebhook(req, res);
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
