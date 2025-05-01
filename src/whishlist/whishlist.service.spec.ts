import { Test, TestingModule } from '@nestjs/testing';
import { WhishlistService } from './whishlist.service';

describe('WhishlistService', () => {
  let service: WhishlistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhishlistService],
    }).compile();

    service = module.get<WhishlistService>(WhishlistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
