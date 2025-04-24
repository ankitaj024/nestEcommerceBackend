import { Injectable , HttpException , HttpStatus } from '@nestjs/common';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FilterService {
  constructor(private readonly prisma:PrismaService){}
  create(createFilterDto: CreateFilterDto) {
    return 'This action adds a new filter';
  }
 

  async getProductByFilters(filters: {
    categoryName?: string;
    subcategoryName?: string;
    priceMin?: number;
    priceMax?: number;
    brandName?: string;
    discountMin?: number;
    discountMax?: number;
    stockMin?: number;
    stockMax?: number;
    color?: string;
    size?: string;
    sortByPrice?: 'asc' | 'desc';
    sortByRating?: 'asc' | 'desc';
  }) {
    try {
      const query: any = {};
  
      // Category Filter
      if (filters.categoryName) {
        const category = await this.prisma.category.findFirst({
          where: {
            name: { equals: filters.categoryName, mode: 'insensitive' },
          },
        });
        if (!category) throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        query.categoryId = category.id;
      }
  
      // Subcategory Filter
      if (filters.subcategoryName) {
        const subcategory = await this.prisma.subcategory.findFirst({
          where: {
            name: { equals: filters.subcategoryName, mode: 'insensitive' },
          },
        });
        if (!subcategory) throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
        query.subcategoryId = subcategory.id;
      }
  
      // Price Filter
      if (filters.priceMin || filters.priceMax) {
        query.price = {
          gte: filters.priceMin || undefined,
          lte: filters.priceMax || undefined,
        };
      }
  
      // Discount Filter
      if (filters.discountMin || filters.discountMax) {
        query.discountPercentage = {
          gte: filters.discountMin || undefined,
          lte: filters.discountMax || undefined,
        };
      }
  
      // Brand Filter
      if (filters.brandName) {
        const brand = await this.prisma.brand.findFirst({
          where: {
            name: { equals: filters.brandName, mode: 'insensitive' },
          },
        });
        if (!brand) throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
        query.brandId = brand.id;
      }
  
      // Stock Filter
      if (filters.stockMin || filters.stockMax) {
        query.stock = {
          gte: filters.stockMin || undefined,
          lte: filters.stockMax || undefined,
        };
      }
  
      // Color Filter
      if (filters.color) {
        query.colors = {
          some: {
            name: {
              equals: filters.color,
              mode: 'insensitive',
            },
          },
        };
      }
  
      // Size Filter
      if (filters.size) {
        query.sizes = {
          some: {
            name: {
              equals: filters.size,
              mode: 'insensitive',
            },
          },
        };
      }
  
      // Sort Options
      const orderBy: any[] = [];
  
      if (filters.sortByPrice) {
        orderBy.push({ price: filters.sortByPrice });
      }
  
      if (filters.sortByRating) {
        orderBy.push({
          reviews: {
            _avg: {
              rating: filters.sortByRating,
            },
          },
        });
      }
  
      // Fetch products
      const products = await this.prisma.product.findMany({
        where: query,
        include: {
          brand: {
            select: {
              name: true,
              logo: true,
            },
          },
          colors: {
            where: filters.color
              ? {
                  name: {
                    equals: filters.color,
                    mode: 'insensitive',
                  },
                }
              : undefined,
            select: {
              name: true,
            },
          },
          sizes: {
            where: filters.size
              ? {
                  name: {
                    equals: filters.size,
                    mode: 'insensitive',
                  },
                }
              : undefined,
            select: {
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
              comment: true,
            },
          },
          specifications: {
            select: {
              name: true,
              value: true,
            },
          },
        },
        orderBy,
      });
  
      if (!products || products.length === 0) {
        throw new HttpException('No products found for the specified filters', HttpStatus.NOT_FOUND);
      }
  
      return products;
    } catch (error) {
      console.error('Error fetching products by filters:', error.message || error);
  
      if (error instanceof HttpException) {
        throw error;
      }
  
      throw new HttpException(
        'Failed to fetch products. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}  