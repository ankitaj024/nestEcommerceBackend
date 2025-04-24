import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateProductSpecificationDto {
  @IsString({ message: 'Specification name must be a string' })
  @MinLength(2, { message: 'Specification name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Specification name must not exceed 100 characters' })
  @IsNotEmpty({ message: 'Specification name is required' })
  name: string;

  @IsString({ message: 'Specification value must be a string' })
  @MinLength(1, { message: 'Specification value must be at least 1 character long' })
  @MaxLength(255, { message: 'Specification value must not exceed 255 characters' })
  @IsNotEmpty({ message: 'Specification value is required' })
  value: string;

  @IsString({ message: 'Product ID must be a string' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;
}

