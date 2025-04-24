import { Test, TestingModule } from '@nestjs/testing';
import { ProductSubPartsService } from './product-sub-parts.service';

describe('ProductSubPartsService', () => {
  let service: ProductSubPartsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductSubPartsService],
    }).compile();

    service = module.get<ProductSubPartsService>(ProductSubPartsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
