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

import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() data: CreateCategoryDto) {
    return this.categoryService.createCategory(data);
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

  @Get('/:name')
  @ApiOperation({
    summary: 'Get all subcategories for a given category by name',
  })
  @ApiParam({ name: 'name', description: 'Category name' })
  getSubcategoriesByCategoryName(@Param('name') name: string) {
    return this.categoryService.getSubcategoriesByCategoryName(name);
  }

  @Get('/:name/:subname')
  @ApiOperation({
    summary:
      'Get all products associated with a subcategory of a given category',
  })
  @ApiParam({ name: 'name', description: 'Category name' })
  @ApiParam({ name: 'subname', description: 'Subcategory name' })
  getProductBySubCategory(
    @Param('name') name: string,
    @Param('subname') subname: string,
  ) {
    return this.categoryService.getProductBySubCategory(name, subname);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  updateCategory(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category by ID' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }
}
