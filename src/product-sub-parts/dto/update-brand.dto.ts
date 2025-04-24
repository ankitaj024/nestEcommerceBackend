import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString({ message: 'Brand name must be a string' })
  @MinLength(2, { message: 'Brand name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Brand name must not exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Logo must be a string' })
  logo?: string;
}
