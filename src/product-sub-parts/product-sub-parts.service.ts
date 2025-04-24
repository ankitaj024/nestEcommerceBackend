import { Injectable  , HttpException ,HttpStatus} from '@nestjs/common';
import { CreateProductSubPartDto } from './dto/create-product-sub-part.dto';
import { UpdateProductSubPartDto } from './dto/update-product-sub-part.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateProductSpecificationDto } from './dto/create-product-specification.dto';
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
          HttpStatus.INTERNAL_SERVER_ERROR
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
        throw new HttpException('Failed to create sizes. Please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
  createReview(createReviewDto: CreateReviewDto) {
    return this.prisma.review.create({ data: createReviewDto });
  }

  async createMultipleSpecifications(createProductSpecificationDtos: CreateProductSpecificationDto[]) {
    try {
      // Using `createMany` to insert multiple specifications at once
      const specifications = await this.prisma.productSpecification.createMany({
        data: createProductSpecificationDtos,
        
      });
  
      return { success: true, specifications };
    } catch (error) {
      console.error('Error creating product specifications:', error.message || error);
  
      // If error is HttpException, rethrow it; otherwise, throw a custom error
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to create specifications. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
  
}
