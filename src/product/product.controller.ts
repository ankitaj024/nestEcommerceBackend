import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCarouselDto } from './dto/create-carousel.dto';

@ApiTags('products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/create-products')
  @ApiOperation({ summary: 'Create multiple products' })
  @ApiBody({ type: [CreateProductDto] })
  @ApiResponse({ status: 201, description: 'Products created successfully' })
  create(@Body() createProductDto: CreateProductDto[]) {
    return this.productService.createProduct(createProductDto);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search for products' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query string' })
  @ApiResponse({ status: 200, description: 'List of matching products' })
  async searchProducts(@Query('q') q: string  ,@Query('catName') catName?: string,) {
    return this.productService.searchProducts(q , catName);
  }

  
  @Get('/filter')
  @ApiOperation({ summary: 'Filter products based on query parameters' })
  @ApiQuery({ name: 'categoryName', required: false, type: String })
  @ApiQuery({ name: 'subcategoryName', required: false, type: String })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'brand', required: false, type: String })
  @ApiQuery({ name: 'discountMin', required: false, type: Number })
  @ApiQuery({ name: 'discountMax', required: false, type: Number })
  @ApiQuery({ name: 'stockMin', required: false, type: Number })
  @ApiQuery({ name: 'stockMax', required: false, type: Number })
  @ApiQuery({ name: 'color', required: false, type: String })
  @ApiQuery({ name: 'size', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Filtered products retrieved' })
  getProductByFilters(@Query() filters: any) {
    return this.productService.getProductByFilters(filters);
  }

  @Get('/get-products')
  @ApiOperation({ summary: 'Get all products with details' })
  @ApiResponse({ status: 200, description: 'All products with details retrieved' })
  findAll() {
    return this.productService.getProductWithDetails();
  }

  @Post('/carousel-creation')
  @ApiOperation({ summary: 'Create a product carousel' })
  @ApiBody({ type: CreateCarouselDto })
  @ApiResponse({ status: 201, description: 'Carousel created successfully' })
  createCarousel(@Body() createCarouseldata: CreateCarouselDto) {
    return this.productService.createCarousel(createCarouseldata);
  }

  @Get('/get-carousel')
  @ApiOperation({ summary: 'Get carousel data' })
  @ApiResponse({ status: 200, description: 'Carousel data retrieved successfully' })
  getCarousel() {
    return this.productService.getCarousel();
  }
}
