import { Module } from '@nestjs/common';
import { ProductSubPartsService } from './product-sub-parts.service';
import { ProductSubPartsController } from './product-sub-parts.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[AuthModule],
  controllers: [ProductSubPartsController],
  providers: [ProductSubPartsService],
})
export class ProductSubPartsModule {}
