import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubCategoryService } from 'src/sub-category/sub-category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService,PrismaService , SubCategoryService],
})
export class CategoryModule {}
