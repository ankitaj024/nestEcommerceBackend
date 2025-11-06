import { IsString, MinLength, MaxLength, Matches, IsNotEmpty } from 'class-validator';

export class CreateProductColorDto {
  @IsString({ message: 'Color name must be a string' })
  @MinLength(2, { message: 'Color name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Color name must not exceed 50 characters' })
  @IsNotEmpty({ message: 'Color name is required' })
  name: string;

  @IsString({ message: 'Hex code must be a string' })
  @Matches(/^#([0-9A-Fa-f]{3}){1,2}$/, {
    message: 'Hex code must be a valid hex color like #FFF or #FFFFFF',
  })
  @IsNotEmpty({ message: 'Hex code is required' })
  hexCode: string;

 
}
