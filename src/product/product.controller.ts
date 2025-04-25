import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Create multiple products' })
  @ApiBody({ type: [CreateProductDto], description: 'Array of products to be created' })
  @ApiResponse({ status: 201, description: 'Products created successfully' })
  @Post('/createManyProducts')
  create(@Body() createProductDto: CreateProductDto[]) {
    return this.productService.createProduct(createProductDto);
  }

  @ApiOperation({ summary: 'Get all products with details' })
  @ApiResponse({ status: 200, description: 'List of all products with their details' })
  @Get('all')
  findAll() {
    return this.productService.getProductWithDetails();
  }
}
