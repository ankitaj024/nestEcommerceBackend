import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateProductSizeDto {
  @IsString({ message: 'Size name must be a string' })
  @MinLength(1, { message: 'Size name must be at least 1 character long' })
  @MaxLength(50, { message: 'Size name must not exceed 50 characters' })
  @IsNotEmpty({ message: 'Size name is required' })
  name: string;

  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;
}
