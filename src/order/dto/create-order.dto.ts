import { IsString, IsNotEmpty, IsOptional, IsArray, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Shipping address for the order',
    example: '123 Main St, Springfield',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
 

  @ApiProperty({
    description: 'Promo code for the order (optional)',
    example: 'PROMO2025',
  })
  @IsOptional()  // Promo code is optional
  @IsString()
  promoCode: string;

  // @ApiProperty({
  //   description: 'Payment token (e.g., from Stripe)',
  //   example: 'tok_visa_123456789',
  // })
  // @IsString()
  // @IsNotEmpty()
  // token: string;

  // @ApiProperty({
  //   description: 'Items in the cart (e.g., product IDs with quantities)',
  //   example: '[{"productId": "product_123", "quantity": 2}, {"productId": "product_456", "quantity": 1}]',
  // })
  // // @IsArray()
  // // @IsJSON()  // Ensure it's a valid JSON array
  // // items: any[]; // You could refine this type with an interface for items if needed
}
