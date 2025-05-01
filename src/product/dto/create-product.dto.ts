import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Min,
  Max,
 IsEnum,
} from 'class-validator';


export enum Rating {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
}
export class CreateProductDto {
   @IsEnum(Rating, { message: 'Rating must be one of the following: ONE, TWO, THREE, FOUR, or FIVE' })
    rating: Rating;
  
  // Title
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  // Description
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description: string;

  // Price
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0.01, { message: 'Price must be greater than 0' })
  price: number;

  // Optional Discount Price
  @IsOptional()
  @IsNumber({}, { message: 'Discount price must be a number' })
  @Min(0, { message: 'Discount price cannot be negative' })
  discountPrice?: number;

  // Optional Discount Percentage
  @IsOptional()
  @IsNumber({}, { message: 'Discount percentage must be a number' })
  @Min(0, { message: 'Discount percentage cannot be negative' })
  @Max(100, { message: 'Discount percentage cannot exceed 100%' })
  discountPercentage?: number;

  // Stock
  @IsNumber({}, { message: 'Stock must be a number' })
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;

  // Images
  @IsArray({ message: 'Images must be an array' })
  @IsString({ each: true, message: 'Each image URL must be a string' })
  @IsNotEmpty({ each: true, message: 'Image URLs must not be empty' })
  images: string[];

  // Foreign Keys
  @IsString({ message: 'Category ID must be a string' })
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString({ message: 'Subcategory ID must be a string' })
  @IsNotEmpty({ message: 'Subcategory ID is required' })
  subcategoryId: string;

  @IsString({ message: 'Brand ID must be a string' })
  @IsNotEmpty({ message: 'Brand ID is required' })
  brandId: string;
}
