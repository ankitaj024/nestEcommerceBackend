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
export class CreateUserDto {
  @IsNotEmpty() // name should not be empty
  @IsString() // name should be a string data type
  @Matches(/^[a-zA-Z\s]{2,30}$/, {
    message:
      'Name must be 2-30 characters long and only contain letters and spaces',
  }) // name should match the required regex
  name: string;

  @IsNotEmpty() // should not empty
  @IsString() // should be a string data
  @IsEmail({}, { message: 'Email must be valid' }) // should be a valid formate that include "@" and "."
  email: string;

  @IsNotEmpty() // should not be empty
  @IsString() // should be a string
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
    message:
      'Password must be at least 6 characters, including at least one letter and one number',
  })
  password: string;

  @IsNotEmpty() // should not be empty
  @IsNumber() // should be a number type , not string
  @Min(1000000000, { message: 'Phone number must be exactly 10 digits' }) // smallest 10-digit number
  @Max(9999999999, { message: 'Phone number must be exactly 10 digits' }) // largest 10-digit number
  phoneNumber: number;

  @IsOptional()
  @IsBoolean() // optional
  isAdmin: boolean;

  @IsOptional() // optional
  @IsString() // should be a string
  address: string;

  @IsOptional()
  @IsString()
  profileImg:string;
}
