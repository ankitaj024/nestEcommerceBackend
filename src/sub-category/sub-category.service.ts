import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubcategoryDto } from './dto/update-sub-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubCategoryService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSubCategoryDto: CreateSubcategoryDto) {
    try {
      const { name, description, image, categoryId } = createSubCategoryDto;

      if (!categoryId) {
        throw new HttpException(
          'Category ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const subcategory = await this.prisma.subcategory.create({
        data: {
          name,
          description,
          image,
          category: {
            connect: { id: categoryId },
          },
        },
      });

      return {
        message: 'Subcategory created successfully',
        data: subcategory,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create subcategory: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createMany(createSubCategoryDto: CreateSubcategoryDto[]) {
    try {
      if (!createSubCategoryDto || createSubCategoryDto.length === 0) {
        throw new HttpException('No subcategories provided', HttpStatus.BAD_REQUEST);
      }
  
      return this.prisma.subcategory.createMany({
        data: createSubCategoryDto,
      });
    } catch (error) {
      console.error(error); 
      throw new HttpException('Error creating subcategories', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
// updating the subcategory here api 

async updateSubcategory(
  id: string,
  data: { name?: string; description?: string; image?: string },
): Promise<{ name: string; description: string; image: string | null }> {
  try {
    const existingSubcategory = await this.prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
    }

    const updatedSubcategory = await this.prisma.subcategory.update({
      where: { id },
      data,
    });

    return updatedSubcategory;
  } catch (error) {
    console.error('Error updating subcategory:', error);

    throw new HttpException(
      'An error occurred while updating the subcategory',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}



 


  

async deleteSubcategory(id: string){
  try {
    const existingSubcategory = await this.prisma.subcategory.findUnique({
      where: { id },
    });

    if (!existingSubcategory) {
      throw new HttpException('Subcategory not found', HttpStatus.NOT_FOUND);
    }

    await this.prisma.subcategory.delete({
      where: { id },
    });

    return { "message":`the subcategory with id : ${id} id deleted` };
  } catch (error) {
    console.error('Error in deleteSubcategory:', error);
    throw new HttpException(
      'Failed to delete subcategory',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

}
