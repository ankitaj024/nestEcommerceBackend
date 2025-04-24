import { Module } from '@nestjs/common';
import { ProductSubPartsService } from './product-sub-parts.service';
import { ProductSubPartsController } from './product-sub-parts.controller';

@Module({
  controllers: [ProductSubPartsController],
  providers: [ProductSubPartsService],
})
export class ProductSubPartsModule {}
