import {
  Injectable,
  HttpException,
  HttpStatus,
  Body,
  Param,
  Req,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateProductSubPartDto } from './dto/create-product-sub-part.dto';
import { UpdateProductSubPartDto } from './dto/update-product-sub-part.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateProductSpecificationDto } from './dto/create-product-specification.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ProductSubPartsService {
  constructor(private readonly prisma: PrismaService) {}

  createBrand(createBrandDtos: CreateBrandDto[]) {
    return this.prisma.brand.createMany({ data: createBrandDtos });
  }

  async createMultipleColors(createProductColorDtos: CreateProductColorDto[]) {
    try {
      // Using `createMany` to insert multiple colors at once
      const colors = await this.prisma.productColor.createMany({
        data: createProductColorDtos,
      });

      return { success: true, colors };
    } catch (error) {
      console.error('Error creating product colors:', error.message || error);

      // If error is HttpException, rethrow, otherwise throw custom error
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to create colors. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  async createMultipleSizes(createProductSizeDtos: CreateProductSizeDto[]) {
    try {
      const sizes = await this.prisma.productSize.createMany({
        data: createProductSizeDtos,
      });

      return { success: true, sizes };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to create sizes. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async createReview(

    
    input: CreateReviewDto & { userId: string; productId: string },
  ) {
    const { userId, productId, rating, comment, images } = input;

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      throw new HttpException(
        'You already reviewed this product',
        HttpStatus.BAD_REQUEST,
      );
    }

    const review = await this.prisma.review.create({
      data: {
        rating,
        comment,
        images,
        userId,
        productId,
      },
    });
   
    const reviews = await this.prisma.review.findMany({ where: { productId } });
    console.log(reviews)
    const totalRating = reviews.reduce((acc, r) => {
      
      let val = Number(r.rating);
      

      return isNaN(val) ? acc : acc + val;
    }, 0);
    
    
    const averageRating = totalRating / reviews.length;

    await this.prisma.product.update({
      where: { id: productId },
      data: { averageRating : averageRating },
    });
console.log(Number(averageRating));
    return { message: 'Review added successfully', review };
  }

  async createMultipleSpecifications(
    createProductSpecificationDtos: CreateProductSpecificationDto[],
  ) {
    try {
      
      const specifications = await this.prisma.productSpecification.createMany({
        data: createProductSpecificationDtos,
      });

      return { success: true, specifications };
    } catch (error) {
      console.error(
        'Error creating product specifications:',
        error.message || error,
      );

      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to create specifications. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

// async getReview()
// {
// try {
  
// } catch (error) {
  
// }
// }

}
