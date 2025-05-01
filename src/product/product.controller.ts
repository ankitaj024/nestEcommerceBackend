import { Controller, Get, Post, Body, Patch, Param, Delete , Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCarouselDto } from './dto/create-carousel.dto';


@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('/create-products')
  create(@Body() createProductDto: CreateProductDto[]) {
    return this.productService.createProduct(createProductDto);
  }

  @Get('get-products')
  findAll() {
    return this.productService.getProductWithDetails();
  }

  @Get()
  getProductByFilters(@Query() filter:any) {
      return this.productService.getProductByFilters(filter);
    }
  @Post('/carousel-creation')
  createCarousel(@Body () createCarouseldata:CreateCarouselDto)
  {
    return this.productService.createCarousel(createCarouseldata)
  }

  @Get('/get-carousel')
getCarousel()
{
  return this.productService.getCarousel();
}
}
