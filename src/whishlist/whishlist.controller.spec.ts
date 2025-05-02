import { Test, TestingModule } from '@nestjs/testing';
import { WhishlistController } from './wishlist.controller';
import { WhishlistService } from './wishlist.service';

describe('WhishlistController', () => {
  let controller: WhishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhishlistController],
      providers: [WhishlistService],
    }).compile();

    controller = module.get<WhishlistController>(WhishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
