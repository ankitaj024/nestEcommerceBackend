import { IsString, IsEnum, IsOptional, IsArray, IsMongoId, IsNotEmpty, MinLength, MaxLength, IsInt } from 'class-validator';

// export enum Rating {
//   ONE = 'ONE',
//   TWO = 'TWO',
//   THREE = 'THREE',
//   FOUR = 'FOUR',
//   FIVE = 'FIVE',
// }

export class CreateReviewDto {
  @IsInt({ message: 'Rating must be one of the following: ONE, TWO, THREE, FOUR, or FIVE' })
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

  // @IsString({ message: 'User ID must be a string' })
  // @IsNotEmpty({ message: 'User ID is required' })
  // userId: string;

  // @IsString({ message: 'Product ID must be a string' })
  // @IsNotEmpty({ message: 'Product ID is required' })
  // productId: string;
}
