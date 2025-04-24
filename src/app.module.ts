import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { ProductModule } from './product/product.module';

import { ProductSubPartsModule } from './product-sub-parts/product-sub-parts.module';
import { FilterModule } from './filter/filter.module';

@Module({
  imports: [UserModule, PrismaModule ,CategoryModule, SubCategoryModule, ProductModule, ProductSubPartsModule, FilterModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
