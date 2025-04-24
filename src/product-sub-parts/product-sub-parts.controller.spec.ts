import { Test, TestingModule } from '@nestjs/testing';
import { ProductSubPartsController } from './product-sub-parts.controller';
import { ProductSubPartsService } from './product-sub-parts.service';

describe('ProductSubPartsController', () => {
  let controller: ProductSubPartsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSubPartsController],
      providers: [ProductSubPartsService],
    }).compile();

    controller = module.get<ProductSubPartsController>(ProductSubPartsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
