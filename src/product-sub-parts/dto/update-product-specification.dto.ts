import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProductSpecificationDto {
  @IsOptional()
  @IsString({ message: 'Specification name must be a string' })
  @MinLength(2, { message: 'Specification name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Specification name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Specification value must be a string' })
  @MinLength(1, { message: 'Specification value must be at least 1 character long' })
  @MaxLength(255, { message: 'Specification value must not exceed 255 characters' })
  value?: string;

  @IsOptional()
  @IsString({ message: 'Product ID must be a string' })
  productId?: string;
}
