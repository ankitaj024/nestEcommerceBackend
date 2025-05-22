import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { Category } from 'src/category/entities/category.entity';
import { Transform } from 'class-transformer';
import { Parser } from 'json2csv';
import { Response } from 'express';
import { resolve } from 'path';
import { rejects } from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { ObjectId } from 'mongodb';

import { parse } from 'path';
import * as csvParser from 'csv-parser';
@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(createProductDto: CreateProductDto[]) {
    try {
      const result = await this.prisma.product.createMany({
        data: createProductDto,
      });
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

  async searchProducts(query: string, catName?: string) {
    if (!query || query.trim().length === 0) {
      throw new HttpException(
        'Search query cannot be empty.',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const searched = await this.prisma.product.findMany({
        where: {
          title: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });
      if (!catName && searched.length > 0) {
        return searched;
      } else {
        console.log(' in category');
        console.log('catName being searched:', catName);

        const catFound = await this.prisma.category.findMany({
          where: {
            name: {
              equals: catName,
              mode: 'insensitive',
            },
          },
        });
        console.log(catFound[0].id);

        const subCategory = await this.prisma.subcategory.findMany({
          where: {
            categoryId: catFound[0].id || undefined,
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        });
        return subCategory;
      }
    } catch (error) {
      throw new HttpException(
        `Failed to search products: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getProductWithDetails() {
    try {
      const product = await this.prisma.product.findMany({
        include: {
          brand: true,
          productColor: {
            select: {
              id: true,
              name: true,
              hexCode: true,
            },
          },
          productSize: {
            select: {
              id: true,
              name: true,
            },
          },
          reviews: true,
          specifications: true,
        },
      });

      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }

      return product;
    } catch (error) {
      console.error(
        'Error fetching product with details:',
        error.message || error,
      );
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

  // applying filter her on product

  async getFilteredProducts(filters: {
    brandIds?: string[];
    categoryIds?: string[];
    subcategoryIds?: string[];
    colorIds?: string[];
    priceMin?: string;
    priceMax?: string;
    discountMin?: string;
    discountMax?: string;
    sortBy?: 'price' | 'discount' | 'rating';
    sortOrder?: 'asc' | 'desc';
  }) {
    try {
      const query: any = {};
  
      // Price filter
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        const priceMin = filters.priceMin ? parseFloat(filters.priceMin) : undefined;
        const priceMax = filters.priceMax ? parseFloat(filters.priceMax) : undefined;
  
        if (
          (priceMin !== undefined && isNaN(priceMin)) ||
          (priceMax !== undefined && isNaN(priceMax))
        ) {
          throw new Error('Invalid price value');
        }
  
        query.price = {
          ...(priceMin !== undefined && { gte: priceMin }),
          ...(priceMax !== undefined && { lte: priceMax }),
        };
      }
  
      // Discount filter
      if (filters.discountMin !== undefined || filters.discountMax !== undefined) {
        const discountMin = filters.discountMin ? parseInt(filters.discountMin, 10) : undefined;
        const discountMax = filters.discountMax ? parseInt(filters.discountMax, 10) : undefined;
  
        if (
          (discountMin !== undefined && (isNaN(discountMin) || discountMin < 0 || discountMin > 100)) ||
          (discountMax !== undefined && (isNaN(discountMax) || discountMax < 0 || discountMax > 100))
        ) {
          throw new Error('Invalid discount value');
        }
  
        query.discountPercentage = {
          ...(discountMin !== undefined && { gte: discountMin }),
          ...(discountMax !== undefined && { lte: discountMax }),
          not: null,
        };
      }
  
      // Brand filter
      if (filters.brandIds?.length) {
        query.brandId = {
          in: Array.isArray(filters.brandIds) ? filters.brandIds : [filters.brandIds],
        };
      }
// category filter
      if (filters.categoryIds?.length) {
        query.categoryId = {
          in: Array.isArray(filters.categoryIds) ? filters.categoryIds : [filters.categoryIds],
        };
      }

      // subcategory filter

  if (filters.subcategoryIds?.length) {
        query.subcategoryId = {
          in: Array.isArray(filters.subcategoryIds) ? filters.subcategoryIds : [filters.subcategoryIds],
        };
      }
      
      // Color filter — renamed correctly
      if (filters.colorIds) {
        const colorIds = Array.isArray(filters.colorIds)
          ? filters.colorIds
          : [filters.colorIds];
      
        if (colorIds.length) {
          query.productColorId = {
            hasSome: colorIds,
          };
        }
       
      }
      
  
      // Sort logic
      const orderBy: any[] = [];
      const sortOrder = filters.sortOrder || 'asc';
  
      switch (filters.sortBy) {
        case 'price':
          orderBy.push({ price: sortOrder });
          break;
        case 'discount':
          orderBy.push({ discountPercentage: sortOrder });
          break;
        case 'rating':
          orderBy.push({ averageRating: sortOrder });
          break;
        default:
          orderBy.push({ createdAt: 'desc' });
      }
  
      const products = await this.prisma.product.findMany({
        where: query,
        orderBy,
        include: {
          brand: { select: { name: true, logo: true } },
          productColor: { select: { name: true } },
          productSize: { select: { name: true } },
          reviews: { select: { rating: true } },
          specifications: true,
        },
      });
  
      return {
        totalCount: products.length,
        products,
      };
    } catch (error) {
      console.error('Filter error:', error);
      throw new HttpException('Could not fetch products', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




  // handling the colors using
  // async filterProductsByColors(colorIds: string[]) {
   
  //   return this.prisma.product.findMany({
  //     where: {
  //       productColorId: {
  //         hasEvery: colorIds, 
  //       },
  //     },
  //   });
  // }
  
  async exportProductsToCSV(res: Response): Promise<void> {
    try {
      const products = await this.getProductWithDetails();
      console.log(products);
      if (!products || products.length === 0) {
        throw new HttpException(
          'No products found to export.',
          HttpStatus.NOT_FOUND,
        );
      }

      const processedProducts = products.map((product) => ({
        title: product.title,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice,
        discountPercentage: product.discountPercentage,
        stock: product.stock,
        images: Array.isArray(product.images) ? product.images.join(', ') : '',
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        brandId: product.brandId,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        averageRating: product.averageRating,
        productColorId: Array.isArray(product.productColorId)
          ? product.productColorId.join(', ')
          : '',
        productSizeId: Array.isArray(product.productSizeId)
          ? product.productSizeId.join(', ')
          : '',
      }));

      const fields = [
        'title',
        'description',
        'price',
        'discountPrice',
        'discountPercentage',
        'stock',
        'images',
        'categoryId',
        'subcategoryId',
        'brandId',
        'createdAt',
        'updatedAt',
        'averageRating',
        'productColorId',
        'productSizeId',
      ];

      const parser = new Parser({ fields });

      const csv = parser.parse(processedProducts);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="products.csv"',
      );

      console.log(csv);
      res.status(200).send(csv);
    } catch (error) {
      console.error('Error exporting products to CSV:', error.message || error);
      throw new HttpException(
        'Failed to export products. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // creating carousel using the csv

  async uploadCSVFile(file: Express.Multer.File) {
    const results = [];

    try {
      if (!file) {
        throw new Error('No file uploaded');
      }
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        file.originalname,
      );

      fs.writeFileSync(filePath, file.buffer);
      return new Promise((resolve, reject) => {
        console.log('thisis the generated fil,epoath here ', filePath);
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data) => {
            results.push({
              brand: data.brand,
              description: data.description,
              image: data.image,
              logoURL: data.logoURL,
              offer: data.offer,
            });
          })
          .on('end', async () => {
            const created = await this.prisma.carousel.createMany({
              data: results,
            });

            resolve({
              message: `${created.count} carousel uploaded successfully.`,
            });
          })
          .on('error', (error) => {
            reject(
              new HttpException(
                'Error parsing CSV file: ' + error.message,
                HttpStatus.BAD_REQUEST,
              ),
            );
          });
      });
    } catch (err) {
      throw new HttpException(
        'Failed to upload CSV: ' + err.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createCarousel(createCarouselDto: CreateCarouselDto) {
    try {
      const result = await this.prisma.carousel.create({
        data: {
          brand: createCarouselDto.brand,
          description: createCarouselDto.description,
          offer: createCarouselDto.offer,
          image: createCarouselDto.image,
          logoURL: createCarouselDto.logoURL,
        },
      });

      return {
        message: 'Carousel created successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error creating carousel:', error.message || error);

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to create carousel. Please try again later.',
          details: error?.message || null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getCarousel() {
    try {
      const carousels = await this.prisma.carousel.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return {
        message: 'Carousels fetched successfully',
        data: carousels,
      };
    } catch (error) {
      console.error('Error fetching carousels:', error.message || error);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to fetch carousels. Please try again later.',
          details: error?.message || null,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
