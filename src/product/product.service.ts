import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { Category } from 'src/category/entities/category.entity';

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
      if (!catName &&(searched.length > 0)) {
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
  async getProductByFilters(filters: {
    categoryName?: string;
    subcategoryName?: string;
    priceMin?: number;
    priceMax?: number;
    brand?: string;
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

      // Convert string values to numbers
      if (filters.priceMin !== undefined)
        filters.priceMin = Number(filters.priceMin);
      if (filters.priceMax !== undefined)
        filters.priceMax = Number(filters.priceMax);
      if (filters.discountMin !== undefined)
        filters.discountMin = Number(filters.discountMin);
      if (filters.discountMax !== undefined)
        filters.discountMax = Number(filters.discountMax);
      if (filters.stockMin !== undefined)
        filters.stockMin = Number(filters.stockMin);
      if (filters.stockMax !== undefined)
        filters.stockMax = Number(filters.stockMax);

      // Category Filter
      if (filters.categoryName) {
        const category = await this.prisma.category.findFirst({
          where: {
            name: { equals: filters.categoryName, mode: 'insensitive' },
          },
        });
        if (!category)
          throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
        query.categoryId = category.id;
      }

      // Subcategory Filter
      if (filters.subcategoryName) {
        const subcategory = await this.prisma.subcategory.findFirst({
          where: {
            name: { equals: filters.subcategoryName, mode: 'insensitive' },
          },
        });
        if (!subcategory)
          throw new HttpException(
            'Subcategory not found',
            HttpStatus.NOT_FOUND,
          );
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

      if (
        filters.discountMin !== undefined ||
        filters.discountMax !== undefined
      ) {
        query.discountPercentage = {
          ...(filters.discountMin !== undefined && {
            gte: Number(filters.discountMin),
          }),
          ...(filters.discountMax !== undefined && {
            lte: Number(filters.discountMax),
          }),
          not: null, // exclude products with null discountPercentage
        };
      }

      // Brand Filter
      if (filters.brand) {
        const brand = await this.prisma.brand.findFirst({
          where: {
            name: { equals: filters.brand, mode: 'insensitive' },
          },
        });
        if (!brand)
          throw new HttpException('Brand not found', HttpStatus.NOT_FOUND);
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
          productColor: {
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
          productSize: {
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
        throw new HttpException(
          'No products found for the specified filters',
          HttpStatus.NOT_FOUND,
        );
      }

      return products;
    } catch (error) {
      console.error(
        'Error fetching products by filters:',
        error.message || error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch products. Please try again later.',
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
