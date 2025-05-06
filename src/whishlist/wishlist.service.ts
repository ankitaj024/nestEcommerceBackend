import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto'; // You may also want to rename this file and class
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Wishlist API
  async create(userId: string, createWishlistDto: CreateWishlistDto) {
    try {
      const product = await this.prisma.product.findUnique({
        where: {
          id: createWishlistDto.productId,
        },
      });
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      const wishlistWithUserFind = await this.prisma.wishlist.findFirst({
        where: {
          userId: userId,
        },
      });

      const newItem = {
        productId: createWishlistDto.productId,
      
      };

      if (wishlistWithUserFind) {
        const items = wishlistWithUserFind.items as any[];
        const index = items.findIndex(
          (item) => item.productId === createWishlistDto.productId,
        );
        if (index > -1) {
          throw new HttpException(
            'Product already in wishlist',
            HttpStatus.BAD_REQUEST,
          );
        } else {
          items.push(newItem);
          const updatedWishlist = await this.prisma.wishlist.update({
            where: {
              id: wishlistWithUserFind.id,
            },
            data: {
              items: items,
            },
          });
          return {
            status: HttpStatus.OK,
            message: 'Wishlist updated successfully',
            data: updatedWishlist,
          };
        }
      }

      const wishlist = await this.prisma.wishlist.create({
        data: {
          userId: userId,
          items: [newItem],
        },
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Wishlist created successfully',
        data: wishlist,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(userId: string) {
    try {
      const wishlist = await this.prisma.wishlist.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!wishlist) {
        throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
      }

      type WishlistItem = { productId?: string };

      const items = wishlist.items as WishlistItem[];

      const productIds = items
        .map((item) => item.productId)
        .filter(
          (id): id is string => typeof id === 'string' && id.trim().length > 0,
        );

      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
        include: {
          brand: true,
          colors: true,
          sizes: true,
          reviews: true,
          specifications: true,
        },
      });

      return {
        status: HttpStatus.OK,
        message: 'Wishlist fetched successfully',
        data: products,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeProductFromWishlist(userId: string, productId: string) {
    try {
      const wishlist = await this.prisma.wishlist.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!wishlist) {
        throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
      }
      const items = wishlist.items as any[];
      const index = items.findIndex((item) => item.productId === productId);
      if (index === -1) {
        throw new HttpException(
          'Product not found in wishlist',
          HttpStatus.NOT_FOUND,
        );
      }
      items.splice(index, 1);
      const updatedWishlist = await this.prisma.wishlist.update({
        where: {
          id: wishlist.id,
        },
        data: {
          items: items,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Product removed from wishlist successfully',
        data: updatedWishlist,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteWishlist(userId: string) {
    try {
      const wishlist = await this.prisma.wishlist.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!wishlist) {
        throw new HttpException('Wishlist not found', HttpStatus.NOT_FOUND);
      }
      await this.prisma.wishlist.delete({
        where: {
          id: wishlist.id,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Wishlist deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
