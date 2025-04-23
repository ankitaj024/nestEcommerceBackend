import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProductService } from 'src/product/product.service';

@Module({
  imports:[AuthModule],
  controllers: [CartController],
  providers: [CartService, ProductService],
  exports:[CartService]
})
export class CartModule {}
