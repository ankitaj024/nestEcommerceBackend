import { IsString, IsOptional, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateBrandDto {
  @IsString({ message: 'Brand name must be a string' })
  @MinLength(2, { message: 'Brand name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Brand name must not exceed 100 characters' })
  @IsNotEmpty({ message: 'Brand name is required' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Logo must be a string' })
  logo?: string;
}
