import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';

@Injectable()
export class PromoCodeService {
  constructor(private prisma: PrismaService) {}

  // Create PromoCode
  async createPromoCode(createPromoDto: CreatePromocodeDto){
    try {
      return await this.prisma.promoCode.create({
        data: createPromoDto,
      });
    } catch (error) {
      throw new BadRequestException('Error creating promo code');
    }
  }

  // Validate Promo Code
  async validateAndApplyPromoCode(userId: string, promoCode: string, orderTotal: number): Promise<{ discount: number }> {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: promoCode },
    });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Promo code is invalid or inactive');
    }

    // Check if the promo code is expired
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      throw new BadRequestException('Promo code has expired');
    }

    // Check if the order meets the minimum order amount for this promo
    if (promo.minOrderAmount && orderTotal < promo.minOrderAmount) {
      throw new BadRequestException(`Minimum order amount is ${promo.minOrderAmount}`);
    }

    // Check global usage limit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    // Check per-user usage limit
    const usageCount = await this.prisma.promoCodeUsage.count({
      where: { userId, promoCodeId: promo.id },
    });

    if (promo.perUserLimit && usageCount >= promo.perUserLimit) {
      throw new BadRequestException('You have already used this promo code the maximum number of times');
    }

    // Calculate the discount based on the discount type
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (promo.discountValue / 100) * orderTotal;
      if (promo.maxDiscountValue && discount > promo.maxDiscountValue) {
        discount = promo.maxDiscountValue;
      }
    } else if (promo.discountType === 'fixed') {
      discount = promo.discountValue;
    }

    return { discount };
  }

  // Mark PromoCode as used
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

    // Increment the global usage count for the promo code
    await this.prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });
  }
}
