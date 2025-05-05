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
    description: 'City for the shipping address',
    example: 'Springfield',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    description: 'Country for the shipping address',
    example: 'Illinois',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'PostalCode for the shipping address',
    example: 'IL',
  })
  @IsNotEmpty()
  postalCode: string;

  // @ApiProperty({
  //   description: 'Payment token (e.g., from Stripe)',
  //   example: 'tok_visa_123456789',
  // })
  // token: string;
}
