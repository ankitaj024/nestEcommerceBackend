import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from 'src/cart/cart.service';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class OrderService {
  private stripe: Stripe;
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  //Order Create API
  async create(userId: any, createOrderDto: CreateOrderDto) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });
      if (!cart || !cart.items) {
        throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
      }

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: cart.totalPrice * 100,
        currency:"INR",
        payment_method:createOrderDto.token,
        confirm:true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });
      
      if(paymentIntent.status==="requires_action"){
        throw new HttpException('Payment requires additional authentication', HttpStatus.BAD_REQUEST);
      }

      // console.log(paymentIntent)
      const chargeId = paymentIntent.latest_charge;
      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          items: cart.items,
          totalPrice: (cart.totalPrice ),
          totalQuantity: cart.totalQuantity,
          address: createOrderDto.address,
          chargeId:chargeId,
          status:"Payment Successful"
        },
      });

      await this.cartService.deleteCart(userId);
      return {
        status: HttpStatus.CREATED,
        message: 'Order Successfull',
        orderDetails: order,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  // product fetching API
  async findOrderOfUser(userId) {
    try {
      const order = await this.prisma.order.findFirst({ where: { userId } });
      if (!order) {
        throw new HttpException('No order Found', HttpStatus.NOT_FOUND);
      }
      return {
        status: HttpStatus.OK,
        message: 'Order Fetched Successfully',
        orderDetails: order,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
