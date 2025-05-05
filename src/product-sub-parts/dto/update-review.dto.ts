import { IsString, IsEnum, IsOptional, IsArray, IsMongoId, IsNotEmpty, MinLength, MaxLength, IsInt  } from 'class-validator';
// import { Rating } from './create-review.dto';

export class UpdateReviewDto {
  @IsOptional()
 @IsInt( { message: 'Rating must be one of the the  1 ,2 , 3 , 4, 5 ' })
   rating: number;
 

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
