import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from 'src/cart/cart.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PromoCodeService } from 'src/promocode/promocode.service';
import Stripe from 'stripe';
import Razorpay = require('razorpay');
import { Request, Response } from 'express';
import * as crypto from 'crypto';

// import crypto from 'crypto';
import { PaypalService } from './paypal.service';
import { EmailService } from 'src/email/email.service';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

@Injectable()
export class OrderService {
  private stripe: Stripe;
  constructor(
    private readonly promocodeservice: PromoCodeService,
    private readonly Paypalservice: PaypalService,
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // create order api using Razorpay
  async createUsingRazorpay(userId: string, createOrderDto: CreateOrderDto) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart || !cart.items) {
        throw new HttpException(
          'Cart is empty or not found',
          HttpStatus.BAD_REQUEST,
        );
      }

      let items: { productId: string }[];
      try {
        items =
          typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
      } catch (e) {
        throw new HttpException(
          'Cart items format is invalid',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const productIds = items.map((item) => item.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (!products.length) {
        throw new BadRequestException('No valid products found in cart');
      }

      const user = await this.prisma.user.findFirst({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      //
      // const { city, country, postalCode, address } = createOrderDto;

      const address =
        createOrderDto.address +
        ' ' +
        createOrderDto.city +
        ' ' +
        createOrderDto.country +
        ' ' +
        createOrderDto.postalCode;
console.log(cart.totalPrice)
const roundedTotalPrice = Number(cart.totalPrice.toFixed(2))*100;
      // const roundedTotalPrice = Math.round(cart.totalPrice);
console.log(roundedTotalPrice)
      if (!user.phoneNumber || !/^\d{10}$/.test(String(user.phoneNumber))) {
        throw new BadRequestException('Invalid or missing phone number');
      }
      const formattedPhoneNumber = `+91${user.phoneNumber}`;

      const link = await razorpayInstance.paymentLink.create({
        amount: roundedTotalPrice,
        currency: 'INR',
        accept_partial: false,
        description: 'Order Payment Link',
        customer: {
          name: user.name,
          email: user.email,
          contact: formattedPhoneNumber,
        },
        notify: {
          sms: true,
          email: true,
        },
        callback_url: 'http://192.168.1.61:3000/#/order',
        
        callback_method: 'get',
      });

      const order = await this.prisma.order.create({
        data: {
          userId,
          items: cart.items,
          totalPrice: roundedTotalPrice/100,
          totalQuantity: Number(cart.totalQuantity),
          address,
          paymentLinkId: link.id,
        },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Payment link created. Awaiting payment.',
        paymentLink: link.short_url,
      };
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new HttpException(
        error.message || 'Something went wrong',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Payment using razorpay
  async orderCreateByPaymentLinkResponse(req) {
    try {
      console.log("Webhook received", req.headers, req.body);

     
      console.log("you are in webhook header part ",req.headers)
      const secret = 'razorpaySecret';
      const signature = req.headers['x-razorpay-signature'];
      
      // const generatedSignature = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
// console.log(generatedSignature,"generatedSignature")
      // if (signature !== generatedSignature) {
      //   throw new HttpException('Invalid Signature', HttpStatus.UNAUTHORIZED);
      // }

      const payload = req.body;
     
     

      const paymentId = payload.payload.payment.entity.id;
     

      if (payload.event === 'payment_link.paid') {
        const paymentLinkId = payload.payload.payment_link.entity.id;

        await this.prisma.order.updateMany({
          where: {
            paymentLinkId,
            status: 'Pending',
          },
          data: {
            status: 'Payment Successful',
            transactionId: paymentId,
          },
        });

        const order = await this.prisma.order.findFirst({
          where: { paymentLinkId },
        });
        console.log("you are in webhook order part")

        if (!order) {
          throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }

        interface OrderItem {
          productId: string;
          // any other fields like quantity, etc.
        }

        const items = order.items as unknown as OrderItem[];

        const productIds = items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
        });

        await this.prisma.$transaction(
          products.map((product) => {
            interface OrderItem {
              productId: string;
              quantity: number;
              // any other fields
            }

            const items = order.items as unknown as OrderItem[];

            const cartItem = items.find(
              (item) => item.productId === product.id,
            );

            const newStock = product.stock - cartItem.quantity;

            if (newStock < 0) {
              throw new Error(
                `Insufficient stock for product ${product.title}`,
              );
            }

            return this.prisma.product.update({
              where: { id: product.id },
              data: { stock: newStock },
            });
          }),
        );

        await this.cartService.deleteCart(order.userId);
        const userId = order.userId;
        const user = await this.prisma.user.findFirst({
          where: { id: userId },
        });
        interface OrderItem {
          productId: string;
          quantity: number;
          // add other fields as needed
        }

        const orderItems = order.items as unknown as OrderItem[];

        await this.emailService.sendOrderConfirmationEmail(
          user.name,
          user.email,
          order.id,
          orderItems,
          order.totalPrice,
        );

        return {
          status: HttpStatus.CREATED,
          message: 'Order Successful & Stock Updated',
          orderDetails: order,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }




  
  // Order fetching API
  async findOrderOfUser(userId:any) {
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

  // applying the paypal payament method integration

  async createUsingPaypal(userId: any, createOrderDto: CreateOrderDto) {
    const cart = await this.prisma.cart.findFirst({ where: { userId } });
    if (!cart || !cart.items)
      throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);

    const paypalOrder = await this.Paypalservice.createOrder(cart.totalPrice);
    const orderId = paypalOrder.id;

    const order = await this.prisma.order.create({
      data: {
        userId,
        items: cart.items,
        totalPrice: cart.totalPrice,
        totalQuantity: cart.totalQuantity,
        address: createOrderDto.address,
        status: 'Pending',
        paymentLinkId: orderId,
      },
    });

    return {
      status: HttpStatus.CREATED,
      orderId,
      approvalLink: paypalOrder.links.find((link) => link.rel === 'approve')
        ?.href,
    };
  }

  async handlePaypalWebhook(req: Request, res: Response) {
    const event = req.body;

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const orderId = event.resource.supplementary_data.related_ids.order_id;

      await this.prisma.order.updateMany({
        where: { paymentLinkId: orderId, status: 'Pending' },
        data: { status: 'Payment Successful' },
      });

      const order = await this.prisma.order.findFirst({
        where: { paymentLinkId: orderId },
      });

      await this.cartService.deleteCart(order.userId);

      return res.status(200).json({ message: 'Order paid and confirmed.' });
    }

    if (
      event.event_type === 'PAYMENT.CAPTURE.DENIED' ||
      event.event_type === 'PAYMENT.CAPTURE.REVERSED'
    ) {
      const orderId = event.resource.supplementary_data.related_ids.order_id;
      console.log('webhook');

      await this.prisma.order.updateMany({
        where: { paymentLinkId: orderId, status: 'Pending' },
        data: { status: 'Payment Canceled' },
      });

      return res
        .status(200)
        .json({ message: 'Payment canceled or failed, order updated.' });
    }

    return res.status(200).json({ message: 'Webhook event received.' });
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
