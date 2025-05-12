import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client'; // ✅ For Prisma.JsonObject

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: any, createCartDto: CreateCartDto) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: createCartDto.productId },
      });

      if (!product) {
        throw new HttpException('No such product Found', HttpStatus.NOT_FOUND);
      }

      if (product.stock < createCartDto.quantity) {
        throw new HttpException('Product stock is not sufficient', HttpStatus.BAD_REQUEST);
      }

      const shippingPrice = 40;
      const GST_RATE = 0.18;

      const quantity = createCartDto.quantity;
      const unitPrice = product.discountPrice;
      const newItemSubtotal = unitPrice * quantity;

      const newItem = {
        productId: createCartDto.productId,
        quantity,
        price: product.price,
        productName: product.title,
        productImage: product.images,
      };

      let cart = await this.prisma.cart.findFirst({ where: { userId } });

      const gstAmount = newItemSubtotal * GST_RATE;
      const totalPrice = newItemSubtotal + gstAmount + shippingPrice;

      const breakdown: Prisma.JsonObject = {
        subtotal: newItemSubtotal,
        gstAmount,
        shippingPrice,
        totalPrice,
      };

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId,
            totalPrice,
            totalQuantity: quantity,
            items: [newItem] as Prisma.JsonArray,
            breakdown,
          },
        });
      } else {
        const items = cart.items as any[];
        const index = items.findIndex(item => item.productId === createCartDto.productId);

        if (index > -1) {
          items[index].quantity += quantity;
        } else {
          items.push(newItem);
        }

        const existingSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const gstAmount = existingSubtotal * GST_RATE;
        const totalPrice = existingSubtotal + gstAmount + shippingPrice;
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

        const updatedBreakdown: Prisma.JsonObject = {
          subtotal: existingSubtotal,
          gstAmount,
          shippingPrice,
          totalPrice,
        };

        cart = await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            items: items as Prisma.JsonArray,
            totalPrice,
            totalQuantity,
            breakdown: updatedBreakdown,
          },
        });
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Added to cart successfully',
        cartDetails: cart,
        breakdown,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCartData(userId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({ where: { userId } });
      if (!cart) {
        return { message: "Cart is empty" };
      }
      
      return {
        status: HttpStatus.OK,
        message: 'Cart Fetched Successfully',
        cartDetails: cart,
        breakdown: cart.breakdown,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeProductQuantityFromCart(userId: any, productId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({ where: { userId } });
      if (!cart) throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);

      let items = cart.items as any[];
      const index = items.findIndex(item => item.productId === productId);

      if (index === -1) throw new HttpException('Product not found in cart', HttpStatus.NOT_FOUND);

      if (items[index].quantity > 1) {
        items[index].quantity -= 1;
      } else {
        items.splice(index, 1);
      }

      const updatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const GST_RATE = 0.18;
      const shippingPrice = 40;
      const gstAmount = updatedSubtotal * GST_RATE;
      const totalPrice = updatedSubtotal + gstAmount + shippingPrice;
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      const updatedCart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: items as Prisma.JsonArray,
          totalQuantity,
          totalPrice,
          breakdown: {
            subtotal: updatedSubtotal,
            gstAmount,
            shippingPrice,
            totalPrice,
          } as Prisma.JsonObject,
        },
      });

      return {
        message: 'Item removed from cart successfully',
        cartDetails: updatedCart,
        breakdown: updatedCart.breakdown,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async removeProductFromCart(userId: any, productId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({ where: { userId } });
      if (!cart) throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);

      let items = cart.items as any[];
      const index = items.findIndex(item => item.productId == productId);

      if (index === -1) {
        throw new HttpException('Product not found in cart', HttpStatus.NOT_FOUND);
      }

      const removedItem = items[index];
      items.splice(index, 1);

      const updatedCart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: items as Prisma.JsonArray,
          totalQuantity: Math.max(0, cart.totalQuantity - (removedItem.quantity || 0)),
          totalPrice: Math.max(0, cart.totalPrice - ((removedItem.price || 0) * (removedItem.quantity || 1))),
        },
      });

      return {
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteCart(userId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({ where: { userId } });
      if (!cart) throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);

      await this.prisma.cart.delete({ where: { id: cart.id } });

      return {
        status: HttpStatus.OK,
        message: 'Cart deleted successfully',
        cartDetail: cart,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Placeholder CRUD
  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
