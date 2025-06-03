import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductAIService } from './product-ai.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService , ProductAIService],
})
export class ProductModule {}
