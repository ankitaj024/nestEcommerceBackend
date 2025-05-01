import { Test, TestingModule } from '@nestjs/testing';
import { WhishlistController } from './whishlist.controller';
import { WhishlistService } from './whishlist.service';

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
