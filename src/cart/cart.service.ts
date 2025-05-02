import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  //Add to cart Service
  async addToCart(userId: any, createCartDto: CreateCartDto) {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          id: createCartDto.productId,
        },
      });

      if (!product) {
        throw new HttpException('No such product Found', HttpStatus.NOT_FOUND);
      }

      let cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });
      const unitPrice = product.discountPrice;
      const additionalPrice = unitPrice * createCartDto.quantity;
      const newItem = {
        productId: createCartDto.productId,
        quantity: createCartDto.quantity,
        price: additionalPrice,
        productName: product.title,
      };

      if(product.stock < createCartDto.quantity) {
        throw new HttpException(
          'Product stock is not sufficient',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId,
            totalPrice: additionalPrice,
            totalQuantity: newItem.quantity,
            items: [newItem],
          },
        });
      } else {
        let items: any[] = cart.items as any[];
        const index = items.findIndex(
          (item) => item.productId === createCartDto.productId,
        );

        if (index > -1) {
          (items[index].quantity += createCartDto.quantity),
            (items[index].price += additionalPrice);
        } else {
          items.push(newItem);
        }

        cart = await this.prisma.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            items,
            totalPrice: cart.totalPrice + additionalPrice,
            totalQuantity: cart.totalQuantity + newItem.quantity,
          },
        });
      }
      return {
        status: HttpStatus.CREATED,
        message: 'Add to cart Successfully',
        cartDetails: cart,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Get card Service
  async getCartData(userId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });
      if (!cart) {
        return {message:"Cart is empty"}
      }
      return {
        status: HttpStatus.OK,
        message: 'Cart Fetched Successfully',
        cartData: cart,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Remove from cart Service
  async removeProductQuantityFromCart(userId: any, productId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });
      // console.log(productId)
      if (!cart) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }
      let items: any[] = cart.items as any[];
      const index = items.findIndex((item) => {
        // console.log(productId)
        return item.productId == productId;
      });
      if (index === -1) {
        throw new HttpException(
          'Product not found in cart',
          HttpStatus.NOT_FOUND,
        );
      }

      const removeItem = items[index];
      const unitPrice = removeItem.price / removeItem.quantity;
      let quantityToReduce = 1;
      let priceToReduce = unitPrice;

      if (removeItem.quantity > 1) {
        removeItem.quantity -= 1;
        removeItem.price -= unitPrice * removeItem.quantity;
      } else {
        items.splice(index, 1);
      }

      const updatedCart = await this.prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items,
          totalQuantity: cart.totalQuantity - quantityToReduce,
          totalPrice: cart.totalPrice - priceToReduce,
        },
      });
      return {
        message: 'Item removed from cart successfully',
        cart: updatedCart,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //Product remove from cart Service
  async removeProductFromCart(userId: any, productId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });
  
      if (!cart) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }
  
      let items: any[] = cart.items as any[];
  
      const index = items.findIndex((item) => item.productId == productId);
  
      if (index === -1) {
        throw new HttpException(
          'Product not found in cart',
          HttpStatus.NOT_FOUND,
        );
      }
  
      const removedItem = items[index];
  
      const quantityToReduce = removedItem.quantity || 0;
      const priceToReduce = removedItem.price || 0;
  
      // Remove the item completely
      items.splice(index, 1);
  
      const updatedCart = await this.prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items,
          totalQuantity: Math.max(0, cart.totalQuantity - quantityToReduce),
          totalPrice: Math.max(0, cart.totalPrice - priceToReduce),
        },
      });
  
      return {
        message: 'Product removed from cart successfully',
        cart: updatedCart,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  

  //Delete cart Service
  async deleteCart(userId: any) {
    try {
      const cart = await this.prisma.cart.findFirst({
        where: { userId },
      });

      if (!cart) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.cart.delete({
        where: { id: cart.id },
      });

      return {
        status: HttpStatus.OK,
        message: 'Cart deleted successfully',
        cartDetail: cart,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  create(createCartDto: CreateCartDto) {
    return 'This action adds a new cart';
  }

  findAll() {
    return `This action returns all cart`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cart`;
  }

  // update(id: number, updateCartDto: UpdateCartDto) {
  //   return `This action updates a #${id} cart`;
  // }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
