import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID of the product to add to the cart',
    example: '66087289d53acdb9de601c99',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to add',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  quantity: number;
}
