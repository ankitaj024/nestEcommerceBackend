import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Updated full name (2-30 characters, only letters and spaces)',
    example: 'Jane Doe',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z\s]{2,30}$/, {
    message:
      'Name must be 2-30 characters long and only contain letters and spaces',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Updated email address (must be valid)',
    example: 'jane.doe@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @ApiPropertyOptional({
    description: 'Updated password (min 6 characters, at least one letter and one number)',
    example: 'NewPass123',
  })
  @IsOptional()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
    message:
      'Password must be at least 6 characters, including at least one letter and one number',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Updated 10-digit phone number',
    example: 9876543210,
  })
  @IsOptional()
  @Matches(/^\d{10}$/, {
    message: 'Phone number must be exactly 10 digits',
  })
  phoneNumber: number;

  @ApiPropertyOptional({
    description: 'Updated address',
    example: '456 Park Avenue, Metropolis',
  })
  @IsOptional()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'Updated account status (true/false)',
    example: true,
  })
  @IsOptional()
  status: boolean;

  @IsOptional()
  profilePicture:string
}
