import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [UserModule, PrismaModule, AuthModule, EmailModule, ConfigModule.forRoot({ isGlobal: true }), CartModule, ProductModule, OrderModule,],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
