import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserWithGoogleDto {
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
    description: 'URL or path to the user profile image',
    example: 'https://example.com/images/user.png',
  })
  @IsNotEmpty()
  @IsString()
  profilePicture: string;
}
