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
  
      if (product.stock < createCartDto.quantity) {
        throw new HttpException(
          'Product stock is not sufficient',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      const shippingPrice = 40;
      const GST_RATE = 0.18;
  
      const unitPrice = product.discountPrice;
      const quantity = createCartDto.quantity;
      const newItemSubtotal = unitPrice * quantity;
  
      const newItem = {
        productId: createCartDto.productId,
        quantity,
        price: product.price,
        productName: product.title,
        productImage: product.images,
      };

      
  
      let cart = await this.prisma.cart.findFirst({
        where: { userId },
      });
  
      if (!cart) {
        const gstAmount = newItemSubtotal * GST_RATE;
        const totalPrice = newItemSubtotal + gstAmount + shippingPrice;
  
        const breakdown = {
          subtotal: newItemSubtotal,
          gstAmount,
          shippingPrice,
          totalPrice,
        };
        cart = await this.prisma.cart.create({
          data: {
            userId,
            totalPrice,
            totalQuantity: quantity,
            items: [newItem],
            breakdown:breakdown,

          },
        });
  
        return {
          status: HttpStatus.CREATED,
          message: 'Added to cart successfully',
          cartDetails: cart,
          breakdown: {
            subtotal: newItemSubtotal,
            gstAmount,
            shippingPrice,
            totalPrice,
          },
        };
      } else {
        let items: any[] = cart.items as any[];
        const index = items.findIndex(
          (item) => item.productId === createCartDto.productId,
        );
  
        if (index > -1) {
          items[index].quantity += quantity;
        } else {
          items.push(newItem);
        }
  
        const existingSubtotal = items.reduce(
          (sum, item) => sum + item.price* item.quantity,
          0,
        );
  
        const gstAmount = existingSubtotal * GST_RATE;
        const totalPrice = existingSubtotal + gstAmount + shippingPrice;
        const totalQuantity = items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
  
        const breakdown = {
          subtotal: existingSubtotal,
          gstAmount,
          shippingPrice,
          totalPrice,
        };
        cart = await this.prisma.cart.update({
          where: { id: cart.id },
          data: {
            items,
            totalPrice,
            totalQuantity,
            breakdown:breakdown,
          },
        });
  
        return {
          status: HttpStatus.CREATED,
          message: 'Added to cart successfully',
          cartDetails: cart,
          breakdown: {
            subtotal: existingSubtotal,
            gstAmount,
            shippingPrice,
            totalPrice,
          },
        };
      }
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
        cartDetails: cart,
        breakdown: cart.breakdown,
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
  
      if (!cart) {
        throw new HttpException('Cart not found', HttpStatus.NOT_FOUND);
      }
  
      let items: any[] = cart.items as any[];
      const index = items.findIndex((item) => item.productId === productId);
  
      if (index === -1) {
        throw new HttpException('Product not found in cart', HttpStatus.NOT_FOUND);
      }
  
      const removeItem = items[index];
      // console.log('removeItem', removeItem);
      const unitPrice = removeItem.price / removeItem.quantity; 
  
    
      if (removeItem.quantity > 1) {
        removeItem.quantity -= 1; 
      } else {
        items.splice(index, 1); 
      }
  
     
      const updatedSubtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      // console.log('updatedSubtotal', updatedSubtotal);
  
     
      const GST_RATE = 0.18;
      const shippingPrice = 40;
      const gstAmount = updatedSubtotal * GST_RATE;
      const totalPrice = updatedSubtotal + gstAmount + shippingPrice;
  
      
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  
     
      const updatedCart = await this.prisma.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          items,
          totalQuantity,
          totalPrice,
          breakdown: {
            subtotal: updatedSubtotal,
            gstAmount,
            shippingPrice,
            totalPrice,
          },
        },
      });
  
      return {
        message: 'Item removed from cart successfully',
        cartDetails: updatedCart,
        breakdown: {
          subtotal: updatedSubtotal,
          gstAmount,
          shippingPrice,
          totalPrice,
        },
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

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}
