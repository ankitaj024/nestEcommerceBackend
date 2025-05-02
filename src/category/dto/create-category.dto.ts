import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Name of the category',
    example: 'Electronics',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the category',
    example: 'This category includes gadgets and electronics.',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Image URL or path for the category',
    example: 'https://example.com/images/electronics.png',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Image must be a string (URL or path)' })
  @MaxLength(500, { message: 'Image path must not exceed 500 characters' })
  image?: string;
}
