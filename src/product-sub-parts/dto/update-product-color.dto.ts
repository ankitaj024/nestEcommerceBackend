import { IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateProductColorDto {
  @IsOptional()
  @IsString({ message: 'Color name must be a string' })
  @MinLength(2, { message: 'Color name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Color name must not exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Hex code must be a string' })
  @Matches(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: 'Hex code must be a valid hex color like #FFF or #FFFFFF',
  })
  hexCode?: string;

  @IsOptional()
  @IsString({ message: 'Product ID must be a string' })
  productId?: string;
}
