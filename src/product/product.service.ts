<<<<<<< HEAD
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private readonly prisma:PrismaService){}

  async create(createProductDto: CreateProductDto) {
    try{
      const createProduct = await this.prisma.Product.create({data:createProductDto})
      return{
        status:HttpStatus.CREATED,
        message:"Product added successfully",
        productDetail : createProduct
      }
    }
    catch(error){
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

=======
import { Injectable , HttpException,HttpStatus} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ProductService {

  constructor(private readonly prisma: PrismaService) {}

  async createProduct( createProductDto: CreateProductDto[]) {
    try {
      const result = await this.prisma.product.createMany({data:createProductDto});
      return {
        message: 'Products created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error creating products:', error.message || error);

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to create products. Please try again later.',
          details: error?.message || null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProductWithDetails() {
    try {
      const product = await this.prisma.product.findMany({
        include: {
          brand: true,  
          colors: true, 
          sizes: true,  
          reviews: true,  
          specifications: true,
        },
      });
  
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
  
      return product;
    } catch (error) {
      console.error('Error fetching product with details:', error.message || error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'Failed to fetch product details. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
  

  

>>>>>>> origin/ajay
  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
