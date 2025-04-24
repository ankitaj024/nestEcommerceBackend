import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
<<<<<<< HEAD
=======
import { UpdateProductDto } from './dto/update-product.dto';
>>>>>>> origin/ajay

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

<<<<<<< HEAD
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

=======
  @Post('/createManyProducts')
  create(@Body() createProductDto: CreateProductDto[]) {
    return this.productService.createProduct(createProductDto);
  }

  @Get('all')
  findAll() {
    return this.productService.getProductWithDetails();
  }

  
>>>>>>> origin/ajay
}
