import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProductDto {
  // Title
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title?: string;

  // Description
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  // Price
  @IsOptional()
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price?: number;

  // Discount Price
  @IsOptional()
  @IsNumber({}, { message: 'Discount price must be a number' })
  @Min(0, { message: 'Discount price cannot be negative' })
  discountPrice?: number;

  // Discount Percentage
  @IsOptional()
  @IsNumber({}, { message: 'Discount percentage must be a number' })
  @Min(0, { message: 'Discount percentage cannot be negative' })
  @Max(100, { message: 'Discount percentage cannot exceed 100%' })
  discountPercentage?: number;

  // Stock
  @IsOptional()
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  // Images
  @IsOptional()
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  @IsNotEmpty({ each: true, message: 'Image URLs must not be empty' })
  images?: string[];

  // Foreign Keys
  @IsOptional()
  @IsString({ message: 'Category ID must be a string' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'Subcategory ID must be a string' })
  subcategoryId?: string;

  @IsOptional()
  @IsString({ message: 'Brand ID must be a string' })
  brandId?: string;
}
