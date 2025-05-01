import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubCategoryService } from './sub-category.service';
import { CreateSubcategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubcategoryDto } from './dto/update-sub-category.dto';

@Controller('subCategory')
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  create(@Body() createSubCategoryDto: CreateSubcategoryDto) {
    return this.subCategoryService.create(createSubCategoryDto);
  }

 
  @Post('/create-many')
  async createMany(@Body() createSubCategoryDto: CreateSubcategoryDto[]) {
    const result = await this.subCategoryService.createMany(createSubCategoryDto);
    return result;
  }
  

  // updating the api 
  @Patch(':id')
  updateSubcategory(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; image?: string },
  ) {
    return this.subCategoryService.updateSubcategory(id, data);
  }


  @Delete(':id')
deleteSubcategory(@Param('id') id: string) {
  return this.subCategoryService.deleteSubcategory(id);
}

 

}
