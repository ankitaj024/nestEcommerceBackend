import { Controller, Get, Post, Body, Patch, Param, Delete  , Req} from '@nestjs/common';
import { ProductSubPartsService } from './product-sub-parts.service';
import { CreateProductSubPartDto } from './dto/create-product-sub-part.dto';
import { UpdateProductSubPartDto } from './dto/update-product-sub-part.dto';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { UpdateProductColorDto } from './dto/update-product-color.dto';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { UpdateProductSizeDto } from './dto/update-product-size.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateProductSpecificationDto } from './dto/create-product-specification.dto';
import { UpdateProductSpecificationDto } from './dto/update-product-specification.dto';
import { get } from 'http';

@Controller()
export class ProductSubPartsController {
  constructor(private readonly productSubPartsService: ProductSubPartsService) {}

 

  @Post('/brand')
  createBrand(@Body() createBrandDtos: CreateBrandDto[]) {
    return this.productSubPartsService.createBrand(createBrandDtos);
  }
  
  @Post('/color')
  createColor(@Body() createProductColorDto: CreateProductColorDto[]) {
    return this.productSubPartsService.createMultipleColors(createProductColorDto);
  }

  @Post('/size')
  createSize(@Body() createProductSizeDto: CreateProductSizeDto[]) {
    return this.productSubPartsService.createMultipleSizes(createProductSizeDto);
  }

 

@Post('/review/:productId')
async createReview(
  @Param('productId') productId: string,
  @Body() createReviewDto: CreateReviewDto,
  @Req() req: Request,
) {
  const userId = createReviewDto.userId;

  return this.productSubPartsService.createReview({
    ...createReviewDto,
    userId,
    productId,
  });
}

// @Get ('/review')
// async getReview()
// {
//   return this.productSubPartsService.getReview();

// }

  @Post('/specification')
  createSpecification(@Body() createProductSpecificationDto: CreateProductSpecificationDto[]) {
    return this.productSubPartsService.createMultipleSpecifications(createProductSpecificationDto);
  }

 
  
}
