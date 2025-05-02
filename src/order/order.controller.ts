import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Request, Response } from 'express';

@ApiTags('Orders')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}



  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Create a new order using Razorpay' })
  @ApiResponse({ status: 201, description: 'Razorpay order initiated' })
  @UseGuards(JwtAuthGuard)
  @Post('/razorpay')
  createUsingRazorpay(@Req() request: Request, @Body() createOrderDto: CreateOrderDto) {
    const userId = String(( request as any ).user.id);
    return this.orderService.createUsingRazorpay(userId, createOrderDto);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all orders for the logged-in user' })
  @ApiResponse({ status: 200, description: 'List of user orders' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() request: Request) {
    const userId = ( request as any ).user.id;
    return this.orderService.findOrderOfUser(userId);
  }

  @ApiOperation({ summary: 'Webhook endpoint for Razorpay payment link' })
  @ApiResponse({ status: 200, description: 'Razorpay webhook processed' })
  @Post('/razorpay/webhook')
  orderCreateByRazorpayLink(@Req() req) {
    return this.orderService.orderCreateByPaymentLinkResponse(req);
  }

}
