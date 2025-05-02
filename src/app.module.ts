import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './category/category.module';
import { SubCategoryModule } from './sub-category/sub-category.module';
import { ProductSubPartsModule } from './product-sub-parts/product-sub-parts.module';
import { PromocodeModule } from './promocode/promocode.module';
import { WishlistModule } from './whishlist/whishlist.module';
import { PdfService } from './utils/pdf/pdf.service';
import { PdfModule } from './utils/pdf/pdf.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    AuthModule,
    EmailModule,
    CartModule,
    ProductModule,
    OrderModule,
    CategoryModule,
    SubCategoryModule,
    ProductSubPartsModule,
    PromocodeModule,
  
   
    
    WishlistModule,
    PdfModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, PdfService],
})
export class AppModule {}
