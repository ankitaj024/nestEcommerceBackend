import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
<<<<<<< HEAD
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, EmailModule, ConfigModule.forRoot({ isGlobal: true }), CartModule, ProductModule, OrderModule,],
=======
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { ProductModule } from './product/product.module';

import { ProductSubPartsModule } from './product-sub-parts/product-sub-parts.module';
import { FilterModule } from './filter/filter.module';

@Module({
  imports: [UserModule, PrismaModule ,CategoryModule, SubCategoryModule, ProductModule, ProductSubPartsModule, FilterModule],
>>>>>>> origin/ajay
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
