// dto/create-carousel.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateCarouselDto {
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  offer?: string;

  @IsString()
  image: string;

  @IsString()  
  logoURL: string;
}
