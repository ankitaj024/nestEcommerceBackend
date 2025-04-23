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

  async getCategories() {
    try {
      const categories = await this.prisma.category.findMany({
        select: {
          name: true,
          description: true,
          image: true,
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
