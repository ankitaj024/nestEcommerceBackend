import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
    message:
      'Password is Incorrect',
  })
  password: string;
}
