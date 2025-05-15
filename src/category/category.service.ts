import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  // api for  creating category here
  async createCategory(data: { name: string; description?: string }) {
    try {
      if (!data || !data.name) {
        throw new HttpException(
          'Category name is required.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const existingCategory = await this.prisma.category.findFirst({
        where: { name: data.name },
      });

      if (existingCategory) {
        throw new HttpException(
          'Category already exists with this name.',
          HttpStatus.CONFLICT,
        );
      }

      const createdCategory = await this.prisma.category.create({ data });

      if (!createdCategory) {
        throw new HttpException(
          'Category could not be created.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return createdCategory;
    } catch (error) {
      // Optional: Log the error
      console.error('Error creating category:', error);

      // Return proper exception
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'An unexpected error occurred.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // getting  subcategories

  async getSubcategoriesByCategoryName(name: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      include: {
        subcategories: {
          select: {
            name: true,
            description: true,
            image: true,
            id:true
          },
        },
      },
    });

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return category.subcategories;
  }

  // getting all categories
  async getAllCategories() {
    try {
      const categories = await this.prisma.category.findMany({
        
        
          select: {
            name: true,
            description: true,
            image: true,
            id:true
          },
        
      });

      if (!categories || categories.length === 0) {
        throw new HttpException('No categories found', HttpStatus.NOT_FOUND);
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
 
      throw new HttpException(
        'An error occurred while fetching categories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // getting product of all categories 

  async getProductsOfALLCategory() {
    try {
      
      const categories = await this.prisma.category.findMany({
        include: {
          products: {
            select: {
              id: true,               
              title: true,            
              description: true,      
              price: true,            
              discountPrice: true,    
              discountPercentage: true,
              stock: true,           
              images: true,           
              createdAt: true,       
              updatedAt: true,        
              subcategory: {          
                select: {
                  name: true,
                  description: true,
                }
              },
              brand: {              
                select: {
                  name: true,
                  logo: true,          
                }
              },
              reviews: {              
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true
                }
              },
              productColor: {           
                select: {
                  name: true,
                }
              },
              productSize: {                
                select: {
                  name: true,
                }
              },
              specifications: {       
                select: {
                  name: true,
                  value: true
                }
              }
            }
          }
        }
      });
  
      
      if (!categories || categories.length === 0) {
        throw new HttpException('No categories found', HttpStatus.NOT_FOUND);
      }
  
     
      return categories;
    } catch (error) {
      
      console.error('Error fetching categories:', error.message || error);
  
   
      if (error instanceof HttpException) {
        
        throw error;
      } else {
        
        throw new HttpException(
          'An error occurred while fetching categories. Please try again later.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // getting data by subcategory 


  async getProductBySubCategory(categoryName: string, subcategoryName: string) {
    try {
      // Step 1: Find the category (case-insensitive)
      const category = await this.prisma.category.findFirst({
        where: {
          name: {
            equals: categoryName,
            mode: 'insensitive',
          },
        },
      });
  
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
  
      // Step 2: Find the subcategory within that category (case-insensitive)
      const subcategory = await this.prisma.subcategory.findFirst({
        where: {
          name: {
            equals: subcategoryName,
            mode: 'insensitive',
          },
          categoryId: category.id,
        },
      });
  
      if (!subcategory) {
        throw new HttpException('Subcategory not found in the specified category', HttpStatus.NOT_FOUND);
      }
  
      // Step 3: Find products that belong to both the category and the subcategory
      const products = await this.prisma.product.findMany({
        where: {
          categoryId: category.id,
          subcategoryId: subcategory.id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          discountPrice: true,
          discountPercentage: true,
          stock: true,
          images: true,
          averageRating: true, 
          brand: {
            select: {
              name: true,
              logo: true,
            },
          },
          productColor: {
            select: {
              name: true,
              hexCode: true,
            },
          },
          productSize: {
            select: {
              name: true,
            },
          },
          reviews: {
            select: {
              rating: true,
              comment: true,
              images: true,
            },
          },
          specifications: {
            select: {
              name: true,
              value: true,
            },
          },
        },
      });
  
      if (!products || products.length === 0) {
        throw new HttpException('No products found for the specified category and subcategory', HttpStatus.NOT_FOUND);
      }
  
      return products;
    } catch (error) {
      console.error('Error fetching products by subcategory:', error.message || error);
  
      if (error instanceof HttpException) {
        throw error;
      }
  
      throw new HttpException(
        'Failed to fetch products by subcategory. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  

  

  // updating the category

  async updateCategory(
    id: string,
    data: { name?: string; description?: string; image?: string },
  ): Promise<{ name: string; description: string; image: string | null }> {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data,
      });

      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);

      throw new HttpException(
        'An error occurred while updating the category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // api for Delete the category based on id

  async deleteCategory(id: string) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // Run both deletions inside a transaction
      await this.prisma.$transaction([
        this.prisma.subcategory.deleteMany({
          where: { categoryId: id },
        }),

        this.prisma.category.delete({
          where: { id },
        }),
      ]);

      return { "message":`the category with id : ${id} id deleted along with the subcategory` };
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      throw new HttpException(
        'Failed to delete category',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
