import { Test, TestingModule } from '@nestjs/testing';
import { PromoCodeService } from './promocode.service';

describe('PromoCodeService', () => {
  let service: PromoCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromoCodeService],
    }).compile();

    service = module.get<PromoCodeService>(PromoCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
