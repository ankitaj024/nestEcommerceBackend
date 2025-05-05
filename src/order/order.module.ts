import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartService } from 'src/cart/cart.service';
import { CartModule } from 'src/cart/cart.module';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalService } from './paypal.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailModule } from 'src/email/email.module';
import { PromocodeModule } from 'src/promocode/promocode.module';


@Module({
  imports:[CartModule, AuthModule , EmailModule , PromocodeModule],
  controllers: [OrderController],
  providers: [OrderService, CartService , PaypalService],
})
export class OrderModule {}
