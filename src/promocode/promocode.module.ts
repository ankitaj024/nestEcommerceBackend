import { Module } from '@nestjs/common';
import { PromoCodeService } from './promocode.service';
import { PromoCodeController } from './promocode.controller';
import { AuthModule } from 'src/auth/auth.module'; // Import the AuthModule here

@Module({
  imports: [AuthModule], // Add the AuthModule to the imports array
  controllers: [PromoCodeController],
  providers: [PromoCodeService],
  exports : [PromoCodeService]
})
export class PromocodeModule {}
