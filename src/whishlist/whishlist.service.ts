import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWhishlistDto } from './dto/create-whishlist.dto';
import { UpdateWhishlistDto } from './dto/update-whishlist.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WhishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Whishlist API
  async create(userId:string,createWhishlistDto: CreateWhishlistDto) {
    try{
    const product = await this.prisma.product.findUnique({
      where: {
        id: createWhishlistDto.productId,
      },
    });
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    const whishlistWithUserFind = await this.prisma.whishlist.findFirst({
      where: {
        userId: userId,
      },
    });
   
    const newitem = {
      productId: createWhishlistDto.productId,
      productName: product.title,
      productPrice: product.price,
    }
    if (whishlistWithUserFind) {
      const items = whishlistWithUserFind.items as any[];
      const index = items.findIndex(
        (item) => item.productId === createWhishlistDto.productId,
      );
      if (index > -1) {
        throw new HttpException('Product already in whishlist', HttpStatus.BAD_REQUEST);
      } else {
        items.push(newitem);
        const updatedWhishlist = await this.prisma.whishlist.update({
          where: {
            id: whishlistWithUserFind.id,
          },
          data: {
            items: items,
          },
        });
        return {
          status: HttpStatus.OK,
          message: 'Whishlist updated successfully',
          data: updatedWhishlist,
        };
      } 
    }
    const whishlist = await this.prisma.whishlist.create({
      data: {
        userId: userId,
        items:[newitem]
      },
    });
    return {
      status: HttpStatus.CREATED,
      message: 'Whishlist created successfully',
      data: whishlist,
    }
  }
  catch (error) {
    throw new HttpException(
      error.message || 'Internal Server Error',
      error.status ||HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }





  }

  async findAll(userId:string) {
    try { 
      const whishlist = await this.prisma.whishlist.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!whishlist) {
        throw new HttpException('Whishlist not found', HttpStatus.NOT_FOUND);
      }
      return {
        status: HttpStatus.OK,
        message: 'Whishlist fetched successfully',
        data: whishlist,
      };
    }
    catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } 
  }

  async removeProductFromWhislist(userId:string, productId: string) {
    try {
      const whishlist = await this.prisma.whishlist.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!whishlist) {
        throw new HttpException('Whishlist not found', HttpStatus.NOT_FOUND);
      }
      const items = whishlist.items as any[];
      const index = items.findIndex((item) => item.productId === productId,productId);
      if (index === -1) {
        throw new HttpException('Product not found in whishlist', HttpStatus.NOT_FOUND);
      }
      items.splice(index, 1);
      const updatedWhishlist = await this.prisma.whishlist.update({
        where: {
          id: whishlist.id,
        },
        data: {
          items: items,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Product removed from whishlist successfully',
        data: updatedWhishlist,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteWhishlist(userId:string) {
    try {
      const whishlist = await this.prisma.whishlist.findFirst({
        where: {
          userId: userId,
        },
      });
      if (!whishlist) {
        throw new HttpException('Whishlist not found', HttpStatus.NOT_FOUND);
      }
      await this.prisma.whishlist.delete({
        where: {
          id: whishlist.id,
        },
      });
      return {
        status: HttpStatus.OK,
        message: 'Whishlist deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal Server Error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
