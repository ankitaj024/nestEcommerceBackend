import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from 'src/cart/cart.service';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import Razorpay = require('razorpay');
import { Request, Response } from 'express';

import crypto from 'crypto';
import { PaypalService } from './paypal.service';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

@Injectable()
export class OrderService {
  private stripe: Stripe;
  constructor(
    private readonly Paypalservice: PaypalService,
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  //Order Create API using stripe
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
        currency: 'INR',
        payment_method: createOrderDto.token,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      if (paymentIntent.status === 'requires_action') {
        throw new HttpException(
          'Payment requires additional authentication',
          HttpStatus.BAD_REQUEST,
        );
      }

      // console.log(paymentIntent)
      const chargeId =
        typeof paymentIntent.latest_charge === 'string'
          ? paymentIntent.latest_charge
          : paymentIntent.latest_charge?.id;

      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          items: cart.items,
          totalPrice: cart.totalPrice,
          totalQuantity: cart.totalQuantity,
          address: createOrderDto.address,
          chargeId: chargeId,
          status: 'Payment Successful',
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

  // create order api using Razorpay
  async createUsingRazorpay(userId: any, createOrderDto: CreateOrderDto) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });
      if (!cart || !cart.items) {
        throw new HttpException('Cart is empty', HttpStatus.BAD_REQUEST);
      }
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
      const link = await razorpayInstance.paymentLink.create({
        amount: cart.totalPrice,
        currency: 'INR',
        accept_partial: false,
        description: 'Order Payment Link',
        customer: {
          name: user.name,
          email: user.email,
          contact: '9782140552',
        },
        notify: {
          sms: true,
          email: true,
        },
        callback_url: 'https://192.168.1.9:3000/users/blog',
        callback_method: 'get',
      });

      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          items: cart.items,
          totalPrice: cart.totalPrice,
          totalQuantity: cart.totalQuantity,
          address: createOrderDto.address,
          status: 'Pending',
          paymentLinkId: link.id,
        },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'Payment link created. Awaiting payment.',
        paymentLink: link.short_url,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Payment using razorpay
  async orderCreateByPaymentLinkResponse(req) {
    try {
      const secret = 'razorpaySecret';
      const signature = req.headers['x-razorpay-signature'];
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== generatedSignature) {
        throw new HttpException('Invalid Signature', HttpStatus.UNAUTHORIZED);
      }
      const payload = req.body;

      if (payload.event === 'payment_link.paid') {
        const paymentLinkId = payload.payload.payment_link.entity.id;

        await this.prisma.order.updateMany({
          where: {
            paymentLinkId,
            status: 'Pending',
          },
          data: {
            status: 'Payment Successful',
          },
        });
        const order = await this.prisma.order.findFirst({
          where: { paymentLinkId },
        });

        await this.cartService.deleteCart(order.userId);

        return {
          status: HttpStatus.CREATED,
          message: 'Order Successfull',
          orderDetails: order,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Order fetching API
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
