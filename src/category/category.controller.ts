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
import { SubCategoryService } from 'src/sub-category/sub-category.service';
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
@Get('/all-categories')
getcategories(){
  return this.categoryService.getAllCategories();
}


//getting all products in store along with categories

  @Get('/all-products')
  findAll() {
    return this.categoryService.getProductsOfALLCategory();
  }

  // getting the subcategories for given category based on name

  @Get('/:name')
  getSubcategoriesByCategoryName(@Param('name') name: string) {
    return this.categoryService.getSubcategoriesByCategoryName(name);
  }

  // getting all products associated with subcategory of an category

  @Get('/:name/:subname')
  getProductBySubCategory(@Param('name') name: string , @Param('subname') subname: string) {
    return this.categoryService. getProductBySubCategory(name ,subname);
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
