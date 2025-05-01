import { IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCartDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  productId: string;

  @IsInt()
  @IsNotEmpty()
  @IsOptional()
  quantity: number;
}