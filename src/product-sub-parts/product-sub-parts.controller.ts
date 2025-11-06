import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProductSubPartsService } from './product-sub-parts.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { CreateProductColorDto } from './dto/create-product-color.dto';
import { CreateProductSizeDto } from './dto/create-product-size.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateProductSpecificationDto } from './dto/create-product-specification.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

@ApiTags('Product Sub Parts') // Tagging all product sub-part related endpoints
@Controller()
@ApiBearerAuth('access-token')
export class ProductSubPartsController {
  constructor(
    private readonly productSubPartsService: ProductSubPartsService,
  ) {}

  // Brand creation endpoint
  @Post('/brand')
  @ApiOperation({
    summary: 'Create product brands',
    description: 'Creates one or more brands for products.',
  })
  @ApiBody({
    type: [CreateBrandDto],
    description: 'Array of product brand data',
  })
  @ApiResponse({
    status: 201,
    description: 'Brands successfully created',
  })
  createBrand(@Body() createBrandDtos: CreateBrandDto[]) {
    return this.productSubPartsService.createBrand(createBrandDtos);
  }
  @Get('/brand')
  @ApiOperation({
    description: 'Fetches all existing product brands.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of product brands fetched successfully.',
  })
  async getAllBrands() {
    return this.productSubPartsService.getAllBrands();
  }

  // Color creation endpoint
  @Post('/color')
  @ApiOperation({
    summary: 'Create product colors',
    description: 'Creates multiple product colors.',
  })
  @ApiBody({
    type: [CreateProductColorDto],
    description: 'Array of product color data',
  })
  @ApiResponse({
    status: 201,
    description: 'Colors successfully created',
  })
  createColor(@Body() createProductColorDto: CreateProductColorDto[]) {
    return this.productSubPartsService.createMultipleColors(
      createProductColorDto,
    );
  }
  @Get('/color')
@ApiOperation({
 
  description: 'Fetches all existing colors with only id and name.',
})
@ApiResponse({
  status: 200,
  description: 'List of product colors fetched successfully.',
  
})
async getAllColors() {
  return this.productSubPartsService.getAllColors(); 
}

  // Size creation endpoint
  @Post('/size')
  @ApiOperation({
    summary: 'Create product sizes',
    description: 'Creates multiple product sizes.',
  })
  @ApiBody({
    type: [CreateProductSizeDto],
    description: 'Array of product size data',
  })
  @ApiResponse({
    status: 201,
    description: 'Sizes successfully created',
  })
  createSize(@Body() createProductSizeDto: CreateProductSizeDto[]) {
    return this.productSubPartsService.createMultipleSizes(
      createProductSizeDto,
    );
  }

  // Review creation endpoint
  @UseGuards(JwtAuthGuard)
  @Post('/review/:productId')
  @ApiOperation({
    summary: 'Create a product review',
    description: 'Allows a user to submit a review for a product.',
  })
  @ApiParam({
    name: 'productId',
    description: 'The ID of the product being reviewed',
    example: '607c72efb8f1a6d68f2f44c1', // Example product ID in URL
  })
  @ApiBody({
    type: CreateReviewDto,
    description: 'The review data for the product',
    examples: {},
  })
  @ApiResponse({
    status: 201,
    description: 'Review successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @UseGuards(JwtAuthGuard)
  async createReview(
    @Param('productId') productId: string, // Extract productId from the URL
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.id;
    return this.productSubPartsService.createReview({
      ...createReviewDto,
      userId,
      productId,
    });
  }

  // Specification creation endpoint
  @Post('/specification')
  @ApiOperation({
    summary: 'Create product specifications',
    description: 'Creates multiple product specifications.',
  })
  @ApiBody({
    type: [CreateProductSpecificationDto],
    description: 'Array of product specification data',
  })
  @ApiResponse({
    status: 201,
    description: 'Specifications successfully created',
  })
  createSpecification(
    @Body() createProductSpecificationDto: CreateProductSpecificationDto[],
  ) {
    return this.productSubPartsService.createMultipleSpecifications(
      createProductSpecificationDto,
    );
  }
}
