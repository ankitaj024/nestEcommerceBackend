import { Module } from '@nestjs/common';
import { WhishlistService } from './whishlist.service';
import { WhishlistController } from './whishlist.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WhishlistController],
  providers: [WhishlistService],
})
export class WhishlistModule {}
