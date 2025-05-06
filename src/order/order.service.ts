import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
// import { UpdateOrderDto } from './dto/update-order.dto';
import { CartService } from 'src/cart/cart.service';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { EmailService } from 'src/email/email.service';

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

@Injectable()
export class OrderService {
  private stripe: Stripe;
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly emailService: EmailService,
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
      const chargeId = paymentIntent.latest_charge;
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
      // console.log(cart);
      const deliveryAddress =
        createOrderDto.address +
        ' ' +
        createOrderDto.city +
        ' ' +
        createOrderDto.country +
        ' ' +
        createOrderDto.postalCode;
      const productIds = cart.items.map((item) => item.productId);
      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
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

      const roundedTotalPrice = Math.round(cart.totalPrice);
      const link = await razorpayInstance.paymentLink.create({
        amount: roundedTotalPrice * 100,
        currency: 'INR',
        accept_partial: false,
        description: 'Order Payment Link',
        customer: {
          name: user.name,
          email: user.email,
          contact: '8850276460',
        },
        notify: {
          sms: true,
          email: true,
        },
        callback_url: 'http://192.168.1.54:3000/order',
        callback_method: 'get',
      });

      const order = await this.prisma.order.create({
        data: {
          userId: userId,
          items: cart.items,
          totalPrice: cart.totalPrice,
          totalQuantity: cart.totalQuantity,
          address: deliveryAddress,
          status: 'Pending',
          paymentLinkId: link.id,
          placedOn: new Date(),
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
      const paymentId = payload.payload.payment.entity.id;

      if (payload.event === 'payment_link.paid') {
        const paymentLinkId = payload.payload.payment_link.entity.id;

        // console.log(paymentLinkId)
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

        if (!order) {
          throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
        }

        const productIds = order.items.map((item) => item.productId);
        const products = await this.prisma.product.findMany({
          where: {
            id: {
              in: productIds,
            },
          },
        });

        await this.prisma.$transaction(
          products.map((product) => {
            const cartItem = order.items.find(
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
        await this.emailService.sendOrderConfirmationEmail(
          user.name,
          user.email,
          order.id,
          order.items,
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
}
