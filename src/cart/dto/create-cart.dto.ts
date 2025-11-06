import { IsInt, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({
    description: 'ID of the product to add to the cart',
    example: '6809e1fbfbdb907607c61e51',
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


  @ApiProperty({
    description: 'ID of the color',
    example: '68245ff089afddbcb991f34b',
  })
  @IsString()
  @IsNotEmpty()
  productColorId: string;


  @ApiProperty({
    description: 'ID of the size',
    example: '6824621489afddbcb991f352',
  })
  @IsString()
  @IsNotEmpty()
  productSizeId: string;
}
