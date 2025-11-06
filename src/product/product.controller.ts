import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
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
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductAIService } from './product-ai.service';
@ApiTags('products')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly aiService: ProductAIService,
  ) {}

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
  @ApiQuery({
    name: 'catName',
    required: false,
    description: 'Search query string',
  })
  @ApiResponse({ status: 200, description: 'List of matching products' })
  async searchProducts(
    @Query('q') q: string,
    @Query('catName') catName?: string,
  ) {
    return this.productService.searchProducts(q, catName);
  }

  // implementing the search API using  the subcategory and the category

  @Get('/search-sub-cat')
  @ApiOperation({ summary: 'Search for products by subcategory and category ' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Search query string',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching  sub category and categories ',
  })
  async searchProductsBySubcatAndCat(@Query('query') query: string) {
    return this.productService.searchProductsBySubcatAndCat(query);
  }

  // New method to trigger CSV export
  @Get('export')
  async exportProducts(@Res() res: Response) {
    await this.productService.exportProductsToCSV(res);
  }

  // for uploading the dat from the csv
  @Post('upload-csv')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCSV(@UploadedFile() file: Express.Multer.File) {
    return this.productService.uploadCSVFile(file);
  }

  @Get('/filter')
  @ApiOperation({ summary: 'Filter products based on query parameters' })
  @ApiQuery({
    name: 'brandIds',
    required: false,
    type: [String],
    isArray: true,
  })
  @ApiQuery({
    name: 'categoryIds',
    required: false,
    type: [String],
    isArray: true,
  })
  @ApiQuery({
    name: 'subcategoryIds',
    required: false,
    type: [String],
    isArray: true,
  })
  @ApiQuery({
    name: 'colorIds',
    required: false,
    isArray: true,
  })
  @ApiQuery({ name: 'priceMin', required: false, type: Number })
  @ApiQuery({ name: 'priceMax', required: false, type: Number })
  @ApiQuery({ name: 'discountMin', required: false, type: Number })
  @ApiQuery({ name: 'discountMax', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'discount'],
  })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Filtered products retrieved' })
  getFilteredProducts(@Query() filters: any) {
    return this.productService.getFilteredProducts(filters);
  }

  @Get('/get-products')
  @ApiOperation({ summary: 'Get all products with details' })
  @ApiResponse({
    status: 200,
    description: 'All products with details retrieved',
  })
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
  @ApiResponse({
    status: 200,
    description: 'Carousel data retrieved successfully',
  })
  getCarousel() {
    return this.productService.getCarousel();
  }

  // rotes for implementing the AI and generating the embedding here
  @Post('/generate-embeddings')
  async generateEmbeddings() {
    console.log(" this is entery of enbediig")
    await this.aiService.generateAndSaveProductEmbeddings();
    return { message: 'Embeddings generated and saved.' };
  }

  @Get('/ai-category-counts')
  async getAICategoryCounts(@Query('q') query: string) {
    return this.aiService.matchProductsToCategories(query);
  }
}
