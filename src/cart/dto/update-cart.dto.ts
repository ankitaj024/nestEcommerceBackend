import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiPropertyOptional({
    description: 'ID of the product to add to the cart',
    example: '66087289d53acdb9de601c99',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  productId: string;

  @ApiPropertyOptional({
    description: 'Quantity of the product to add',
    example: 2,
  })
  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  quantity: number;
}
