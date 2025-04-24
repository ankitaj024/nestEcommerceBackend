import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Image must be a string (URL or path)' })
  @MaxLength(500, { message: 'Image path must not exceed 500 characters' })
  image?: string;
}
