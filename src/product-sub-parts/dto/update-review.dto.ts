import { IsOptional, IsEnum, IsString, IsArray, IsMongoId, MinLength, MaxLength } from 'class-validator';
import { Rating } from './create-review.dto';

export class UpdateReviewDto {
  @IsOptional()
  @IsEnum(Rating, { message: 'Rating must be one of the following: ONE, TWO, THREE, FOUR, or FIVE' })
  rating?: Rating;

  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  @MinLength(5, { message: 'Comment must be at least 5 characters long' })
  @MaxLength(1000, { message: 'Comment must not exceed 1000 characters' })
  comment?: string;

  @IsOptional()
  @IsArray({ message: 'Images must be an array of strings' })
  @IsString({ each: true, message: 'Each image must be a string' })
  images?: string[];

  @IsOptional()
  @IsString({ message: 'User ID must be a string' })
  userId?: string;

  @IsOptional()
  @IsString({ message: 'Product ID must be a string' })
  productId?: string;
}
