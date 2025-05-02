import { Controller, Post, Body, UseGuards, BadRequestException , Request } from '@nestjs/common';
import { PromoCodeService } from './promocode.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';

import { AuthService } from 'src/auth/auth.service';

@Controller('promocode')
export class PromoCodeController {
  constructor(private readonly promocodeService: PromoCodeService) {}

  // Endpoint to create a promo code
  @Post('/create')
  @UseGuards(JwtAuthGuard)
  async createPromoCode(@Body() createPromoDto: CreatePromocodeDto) {
    return this.promocodeService.createPromoCode(createPromoDto);
  }

  // Endpoint to apply promo code directly
  @Post('/apply')
  @UseGuards(JwtAuthGuard) // Ensure only authenticated users can apply promo code
  async applyPromoCode(@Request() req, @Body() body: { promoCode: string; orderTotal: number }) {
    const userId = req.user.id;  // Access userId from the JWT token
    const { promoCode, orderTotal } = body;

    try {
      // Validate promo code and get discount
      const { discount } = await this.promocodeService.validateAndApplyPromoCode(userId, promoCode, orderTotal);
      return { discount };  // Send the discount back as a response
    } catch (e) {
      throw new BadRequestException(e.message);  // If an error occurs, handle it here
    }
  }
}
