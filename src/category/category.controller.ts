import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // creating  the category

  @Post()
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.categoryService.createCategory(data); // pass body directly
  }

  // getting all  category

  @Get('/All')
  findAll() {
    return this.categoryService.getCategories();
  }

  // getting the subcategories for given category based on name

  @Get('/:name')
  getSubcategoriesByCategoryName(@Param('name') name: string) {
    return this.categoryService.getSubcategoriesByCategoryName(name);
  }

  // Update category by ID
  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; image?: string },
  ) {
    return this.categoryService.updateCategory(id, data);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
