import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateProductSizeDto {
  @IsOptional()
  @IsString({ message: 'Size name must be a string' })
  @MinLength(1, { message: 'Size name must be at least 1 character long' })
  @MaxLength(50, { message: 'Size name must not exceed 50 characters' })
  name?: string;


}
