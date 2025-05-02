import { Controller, Post, Body, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { PromoCodeService } from './promocode.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('PromoCode')
@ApiBearerAuth('access-token') // Enable Swagger auth for this controller
@Controller('promocode')
export class PromoCodeController {
  constructor(private readonly promocodeService: PromoCodeService) {}

  @Post('/create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new promo code' })
  @ApiResponse({ status: 201, description: 'Promo code created successfully' })
  @ApiBody({ type: CreatePromocodeDto })
  createPromoCode(@Body() createPromoDto: CreatePromocodeDto) {
    return this.promocodeService.createPromoCode(createPromoDto);
  }

  @Post('/apply')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply a promo code to an order' })
  @ApiResponse({ status: 200, description: 'Promo code applied successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        promoCode: { type: 'string', example: 'SAVE10' },
        orderTotal: { type: 'number', example: 1500 },
      },
      required: ['promoCode', 'orderTotal'],
    },
  })
  async applyPromoCode(@Request() req, @Body() body: { promoCode: string}) {
    const userId = req.user.id;
    const { promoCode } = body;

    try {
      const { discount } = await this.promocodeService.validateAndApplyPromoCode(userId, promoCode);
      return { discount };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
