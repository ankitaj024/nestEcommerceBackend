import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartService } from 'src/cart/cart.service';
import { CartModule } from 'src/cart/cart.module';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports:[CartModule, AuthModule, EmailModule],
  controllers: [OrderController],
  providers: [OrderService, CartService],
})
export class OrderModule {}
