import { IsEmail, IsNotEmpty, Matches  , MinLength} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;
  @ApiProperty({
    example: 'Password123',
    description: 'User password',
  })
  @IsNotEmpty()
  password: string;
}
