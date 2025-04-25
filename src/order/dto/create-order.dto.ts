import { IsString, IsNotEmpty } from 'class-validator';
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
    description: 'Payment token (e.g., from Stripe)',
    example: 'tok_visa_123456789',
  })
  token: string;
}
