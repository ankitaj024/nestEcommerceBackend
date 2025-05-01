import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Full name of the user (2-30 characters, letters and spaces only)',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z\s]{2,30}$/, {
    message:
      'Name must be 2-30 characters long and only contain letters and spaces',
  })
  name: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john@example.com',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiProperty({
    description:
      'Password must be at least 6 characters, including at least one letter and one number',
    example: 'Password123',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
    message:
      'Password must be at least 6 characters, including at least one letter and one number',
  })
  password: string;

  @ApiProperty({
    description: '10-digit phone number',
    example: 9876543210,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000000000, { message: 'Phone number must be exactly 10 digits' })
  @Max(9999999999, { message: 'Phone number must be exactly 10 digits' })
  phoneNumber: number;

  @ApiPropertyOptional({
    description: 'Whether the user is an admin or not',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isAdmin: boolean;

  @ApiPropertyOptional({
    description: 'User address (optional)',
    example: '123 Main St, Springfield',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'URL or path to the user profile image',
    example: 'https://example.com/images/user.png',
  })
  @IsOptional()
  @IsString()
  profilePicture: string;
}
