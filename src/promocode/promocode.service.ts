import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { Promocode } from './entities/promocode.entity';

@Injectable()
export class PromoCodeService {
  constructor(private prisma: PrismaService) {}

  // Create PromoCode
  async createPromoCode(createPromoDto: CreatePromocodeDto) {
    try {
      return await this.prisma.promoCode.create({
        data: createPromoDto,
      });
    } catch (error) {
      throw new BadRequestException('Error creating promo code');
    }
  }

  // Validate Promo Code
  async validateAndApplyPromoCode(userId: string, promoCode: string) {
  try {
    console.log(`Validating promo code "${promoCode}" for user ${userId}`);

    if (!promoCode || promoCode === 'null') {
      throw new BadRequestException('Invalid promo code');
    }
    
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: promoCode }
    });
    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    if (!promo.isActive) {
      throw new BadRequestException('Promo code is inactive');
    }

    if (promo.expiresAt && new Date() > promo.expiresAt) {
      throw new BadRequestException('Promo code has expired');
    }

    const cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      throw new BadRequestException('Cart not found for user');
    }

    console.log(cart)

    const cartTotal =(cart as any)?.breakdown?.totalPrice;
        console.log(cartTotal)

    if (typeof cartTotal !== 'number') {
      throw new BadRequestException('Cart total price is not available');
    }
    console.log(cartTotal)

    if (promo.minOrderAmount && cartTotal < promo.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount is ${promo.minOrderAmount}`,
      );
    }

    if (promo.usageLimit && (promo.usedCount || 0) >= promo.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    const usageCount = await this.prisma.promoCodeUsage.count({
      where: { userId, promoCodeId: promo.id },
    });

    if (promo.perUserLimit && usageCount >= promo.perUserLimit) {
      throw new BadRequestException(
        'You have already used this promo code the maximum number of times',
      );
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      if (typeof promo.discountValue !== 'number') {
        throw new BadRequestException('Invalid discount value');
      }
      discount = (promo.discountValue / 100) * cartTotal;

      if (promo.maxDiscountValue && discount > promo.maxDiscountValue) {
        discount = promo.maxDiscountValue;
      }
    } else if (promo.discountType === 'fixed') {
      if (typeof promo.discountValue !== 'number') {
        throw new BadRequestException('Invalid fixed discount value');
      }
      discount = promo.discountValue;
    }

    const newTotalPrice = Math.max(cartTotal - discount, 0); // Never allow negative total
    console.log(`Discount applied: ${discount}, New total: ${newTotalPrice}`);

    const updatedCart = await this.prisma.cart.update({
      where: { id: cart.id },
      data: { totalPrice: newTotalPrice },
    });

    return {
    promoCode,
      discount,
      updatedCart,
    };
  } catch (error) {
    console.error('Error applying promo code:', error);
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException('Failed to apply promo code');
  }
}


// const newTotalPrice= cart.totalPrice-discount;



  async getAllPromoCodes() {
    try {
      const promocodes = await this.prisma.promoCode.findMany();

      if (!promocodes || promocodes.length === 0) {
        throw new BadRequestException('No promo codes found');
      }

      return promocodes.map((p) => p.code);
    } catch (error) {
      throw error;
    }
  }

  async markPromoCodeAsUsed(userId: string, promoCode: string): Promise<void> {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: promoCode },
    });

    if (!promo) {
      throw new BadRequestException('Promo code not found');
    }

    await this.prisma.promoCodeUsage.create({
      data: {
        userId,
        promoCodeId: promo.id,
      },
    });

    await this.prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });
  }
}
