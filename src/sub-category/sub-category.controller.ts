import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';

import { SubCategoryService } from './sub-category.service';
import { CreateSubcategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubcategoryDto } from './dto/update-sub-category.dto';

@ApiTags('SubCategories')
@Controller('subCategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @ApiOperation({ summary: 'Create a new subcategory' })
  @ApiBody({ type: CreateSubcategoryDto, description: 'Subcategory data to be created' })
  @ApiResponse({ status: 201, description: 'Subcategory created successfully' })
  @Post()
  create(@Body() createSubCategoryDto: CreateSubcategoryDto) {
    return this.subCategoryService.create(createSubCategoryDto);
  }

 
  @Post('/create-many')
  async createMany(@Body() createSubCategoryDto: CreateSubcategoryDto[]) {
    const result = await this.subCategoryService.createMany(createSubCategoryDto);
    return result;
  }

  @ApiOperation({ summary: 'Update an existing subcategory by ID' })
  @ApiResponse({ status: 200, description: 'Subcategory updated successfully' })
  @Patch(':id')
  updateSubcategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; image?: string },
  ) {
    return this.subCategoryService.updateSubcategory(id, data);
  }

  @ApiOperation({ summary: 'Delete a subcategory by ID' })
  @ApiResponse({ status: 200, description: 'Subcategory deleted successfully' })
  @Delete(':id')
  deleteSubcategory(@Param('id') id: string) {
    return this.subCategoryService.deleteSubcategory(id);
  }
}
